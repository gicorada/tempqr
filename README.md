# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

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

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


Backend functions:

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

    SELECT already_validated, text, organization_id
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

  RETURN to_jsonb(json_build_object('status', status));

EXCEPTION
  WHEN OTHERS THEN
    RETURN to_jsonb(json_build_object('status', 'error', 'message', SQLERRM));
END;
$$;





CREATE OR REPLACE FUNCTION add_qr()
RETURNS uuid
AS $$
DECLARE
  generated_uuid UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth.uid() is NULL';
  END IF;

  generated_uuid := gen_random_uuid();
  INSERT INTO public.qr (id, organization_id) VALUES (generated_uuid, get_user_organization());

  RETURN generated_uuid;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS jsonb
AS $$
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
$$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth.uid() is NULL';
  END IF;

  SELECT is_admin
  INTO is_admin
  FROM public.memberships
  WHERE user_id = auth.uid();

  RETURN is_admin;
END;
$$;




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