import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  Vibration,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { validate as validateUUID } from "uuid";
import { supabase } from "../utils/supabase";
import ModalComponent from "./ModalComponent";

// import hook
import { useTranslation } from "react-i18next";

// Custom styling
import { Buttons } from "../constants/Buttons";

export default function Scan() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(true);
  const [data, setData] = useState(null);
  const [scamModalVisible, setScamModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [alreadyValidatedModalVisible, setAlreadyValidatedModalVisible] =
    useState(false);
  const [notValidModalVisible, setNotValidModalVisible] = useState(false);
  const [otherOrganizationModalVisible, setOtherOrganizationModalVisible] =
    useState(false);
  const [noInternetModalVisible, setNoInternetModalVisible] = useState(false);
  const { t } = useTranslation();

  const shakeAnimationValue = new Animated.Value(0);

  const SCAM_PATTERN = [5, 50, 5, 100, 5, 50, 5, 100, 5, 50, 500];

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  if (hasPermission === null) {
    return <Text>{t("scan.cameraPermissionRequest")}</Text>;
  }
  if (hasPermission === false) {
    return <Text>{t("scan.noCameraPermission")}</Text>;
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    Vibration.vibrate(100);
    setScanned(true);
    // Check if the scanned data is a valid UUID
    if (!validateUUID(data)) {
      setScamModalVisible(true);
      Vibration.vibrate(SCAM_PATTERN, true);
      return;
    }

    try {
      const { data: supabaseData, error } = await supabase.rpc("check_qr", {
        qr_uuid: data,
      });

      if (error) {
        throw error;
      } else {
        setData(supabaseData.status);

        if (supabaseData.status === "ok") {
          setSuccessModalVisible(true);
        } else if (supabaseData.status === "already_validated") {
          setAlreadyValidatedModalVisible(true);
        } else if (supabaseData.status === "wrong_organization") {
          setOtherOrganizationModalVisible(true);
        } else {
          setNotValidModalVisible(true);
        }
      }
    } catch (error) {
      if (error.message === "TypeError: Network request failed") {
        setNoInternetModalVisible(true);
      }
      console.error("Error fetching data from Supabase:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        style={{ width: 430, height: 100, flex: 1 }} // Very temporary fix, i hate this fix
      />

      <TouchableOpacity
        onPress={() => setScanned(false)}
        activeOpacity={0.8}
        style={[
          Buttons.button,
          { maxHeight: 250 },
          scanned ? styles.buttonScanned : styles.buttonNotScanned,
        ]}
      >
        {scanned ? (
          <Text style={Buttons.buttonText}>{t("scan.scanAgain")}</Text>
        ) : (
          <Text style={Buttons.buttonText}>{t("scan.scanning")}.</Text>
        )}
      </TouchableOpacity>

      <View>
        {/* Modal Components */}
        <ModalComponent
          visible={scamModalVisible}
          onClose={() => {
            setScamModalVisible(false);
            Vibration.cancel();
          }}
          icon="alert-circle"
          animateIcon={true}
          title={t("scan.modals.scam.title")}
          text={t("scan.modals.scam.description")}
          buttonColor="red"
        />

        <ModalComponent
          visible={successModalVisible}
          onClose={() => setSuccessModalVisible(false)}
          icon="checkmark-circle"
          animateIcon={false}
          title={t("scan.modals.success.title")}
          text={t("scan.modals.success.description")}
          buttonColor="green"
        />

        <ModalComponent
          visible={alreadyValidatedModalVisible}
          onClose={() => setAlreadyValidatedModalVisible(false)}
          icon="arrow-undo-circle"
          animateIcon={false}
          title={t("scan.modals.alreadyValidated.title")}
          text={t("scan.modals.alreadyValidated.description")}
          buttonColor="orange"
        />

        <ModalComponent
          visible={notValidModalVisible}
          onClose={() => setNotValidModalVisible(false)}
          icon="close-circle"
          animateIcon={false}
          title={t("scan.modals.error.title")}
          text={t("scan.modals.error.description")}
          buttonColor="red"
        />

        <ModalComponent
          visible={otherOrganizationModalVisible}
          onClose={() => setOtherOrganizationModalVisible(false)}
          icon="business"
          animateIcon={false}
          title={t("scan.modals.otherOrganization.title")}
          text={t("scan.modals.otherOrganization.description")}
          buttonColor="darkred"
        />

        <ModalComponent
          visible={noInternetModalVisible}
          onClose={() => setNoInternetModalVisible(false)}
          icon="wifi"
          animateIcon={false}
          title={t("scan.modals.otherOrganization.title")}
          text={t("scan.modals.otherOrganization.description")}
          buttonColor="grey"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  buttonScanned: {
    backgroundColor: "blue",
  },
  buttonNotScanned: {
    backgroundColor: "red",
  },
});
