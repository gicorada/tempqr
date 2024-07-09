import { router } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../utils/supabase";

export default function IndexPage() {

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/(tabs)/home/");
      } else {
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/(tabs)/home/");
      } else {
        router.replace("/(auth)/login");
      }
    });
  }, []);

}
