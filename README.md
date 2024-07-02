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

CREATE OR REPLACE FUNCTION check_qr(qr_uuid UUID)
RETURNS JSON
AS $$
DECLARE
  status TEXT := 'not_found';
  qr_data RECORD;
  user_organization_id UUID;
BEGIN
  SELECT organization_id
    INTO user_organization_id
    FROM memberships
    WHERE user_id = auth.uid();

  SELECT already_validated, text, organization_id
    INTO qr_data
    FROM public.qr
    WHERE id = qr_uuid;

  IF FOUND THEN
    IF user_organization_id != qr_data.organization_id THEN
      status := 'wrong_organization';
    ELSE
      IF qr_data.already_validated THEN
        status := 'already_validated';
      ELSE
        UPDATE public.qr
          SET already_validated = true
          WHERE id = qr_uuid;
        status := 'ok';
      END IF;
    END IF;
  END IF;

  RETURN to_jsonb(json_build_object('status', status));
EXCEPTION
  WHEN others THEN
    RETURN to_jsonb(json_build_object('status', 'error', 'message', SQLERRM));
END;
$$ LANGUAGE plpgsql;

