import { router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useNetInfo } from "@react-native-community/netinfo";

export default function IndexPage() {
  const [isConnected, setIsConnected] = useState(true) 
  const netInfo = useNetInfo()

  useEffect(() => {
    setIsConnected(netInfo.isConnected as boolean)
  })

  useEffect(() => {
    if(!isConnected) router.replace("/(auth)/offline")
      
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
