import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { supabase } from "../../utils/supabase";
import QRCode from "react-native-qrcode-svg";

// import hook
import { useTranslation } from "react-i18next";

// Custom styling
import { Buttons } from "../../constants/Buttons";
import { Inputs } from "@/constants/Inputs";
import { Texts } from "@/constants/Texts";

export default function Tab() {
  const [data, setData] = useState<{ uuid: string } | null>(null);
  const [qrCreated, setQrCreated] = useState(false);
  const [qrValue, setQRValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrText, setQrText] = useState("");
  const { t } = useTranslation();

  const createQRCode = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const { data: supabaseData, error } = await supabase.rpc("add_qr", {
        user_text: qrText,
      });

      if (error) {
        throw error;
      } else {
        setQrCreated(true);
        setQrText("");
        setQRValue(supabaseData);
      }
    } catch (error: any) {
      console.error("Error fetching data from Supabase:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[{ position: "absolute", top: 10 }]}>
        {qrValue ? (
          <QRCode
            value={qrValue}
            size={250}
            color="black"
            backgroundColor="white"
          />
        ) : (
          <Text style={Texts.text}>{t("create.qrPlaceholder")}</Text>
        )}
      </View>

      <View style={[{ position: "absolute", bottom: 10 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={createQRCode}
          disabled={isLoading}
          style={Buttons.button}
        >
          <Text style={Buttons.buttonText}>
            {isLoading ? t("create.loading") : t("create.newQR")}
          </Text>
        </TouchableOpacity>

        <TextInput
          value={qrText}
          onChangeText={(text) => setQrText(text)}
          style={Inputs.input}
          placeholder={t("create.enterText")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
