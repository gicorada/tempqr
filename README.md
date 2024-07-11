# Welcome to TempQR 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Try TempQR

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can also find the latest release in the project release page

## Backend
Before running the app, you need the url and the key of the backend.
You have to write an email to me (address in my profile) to get the url and the key.
When you get them, put them in the gitignored file .env.local in the root of the project.


Backend functions:

CHECK_QR(UUID)
```sql
create function check_qr(qr_uuid uuid) returns json
    language plpgsql
as
$$
DECLARE
    status TEXT := 'not_found';
    qr_data RECORD;
    user_organization_id UUID := get_user_organization()->>'id';
BEGIN
    IF user_organization_id IS NULL THEN
      RAISE EXCEPTION 'The user is not in an organization';
    END IF;

    SELECT already_validated, qr_text, organization_id
      INTO qr_data
      FROM public.qr
      WHERE id = qr_uuid;

    IF NOT FOUND THEN
      RETURN to_jsonb(json_build_object('status', status));
    END IF;

    IF user_organization_id != qr_data.organization_id THEN
      status := 'wrong_organization';
    ELSE
      IF qr_data.already_validated THEN
        status := 'already_validated';
      ELSE
        UPDATE public.qr
          SET already_validated = TRUE, validated_at = now(), validated_by = auth.uid()
          WHERE id = qr_uuid;
        status := 'ok';
      END IF;
    END IF;

  RETURN to_jsonb(json_build_object('status', status, 'text', qr_data.qr_text));

EXCEPTION
  WHEN OTHERS THEN
    RETURN to_jsonb(json_build_object('status', 'error', 'message', SQLERRM));
END;
$$;
```

ADD_QR(TEXT)
```sql
create function add_qr(user_text text) returns uuid
    language plpgsql
as
$$
DECLARE
  generated_uuid UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth.uid() is NULL';
  END IF;

  generated_uuid := gen_random_uuid();
  INSERT INTO public.qr (id, organization_id, qr_text) VALUES (generated_uuid, (get_user_organization()->>'id')::uuid, user_text);

  RETURN generated_uuid;
END;
$$;
```

GET_USER_ORGANIZATION()
```sql
create function get_user_organization() returns jsonb
    language plpgsql
as
$$
DECLARE
  user_organization UUID;
  organization_info RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth.uid() is NULL';
  END IF;

  SELECT organization_id
    INTO user_organization
    FROM public.memberships
    WHERE (memberships.user_id = auth.uid());

  SELECT *
    INTO organization_info
    FROM public.organizations
    WHERE (organizations.id = user_organization);

  RETURN to_jsonb(json_build_object('id', organization_info.id, 'name', organization_info.name));
END;
$$;
```

IS_ADMIN_USER()
```sql
create function is_admin_user() returns boolean
    language plpgsql
as
$$
DECLARE
  status BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth.uid() is NULL';
  END IF;

  SELECT is_admin
  INTO status
  FROM public.memberships
  WHERE user_id = auth.uid();

  RETURN status;
END;
$$;
```

VALIDATED_BY_USER()
```sql
create function validated_by_user() returns json
    language plpgsql
as
$$
DECLARE
    result JSON;
BEGIN
    IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth.uid() is NULL';
    END IF;

    result := (
        SELECT jsonb_agg(jsonb_build_object('id', id, 'text', text, 'validated_at', validated_at))
        FROM public.qr
        WHERE auth.uid() = validated_by
    );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN to_jsonb(json_build_object('status', 'error', 'message', SQLERRM));
END;
$$;
```
