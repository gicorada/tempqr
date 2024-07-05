import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Pressable, Modal, Animated, Vibration } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { validate as validateUUID } from 'uuid';
import { supabase } from '../utils/supabase';
import ModalComponent from './ModalComponent';

// Custom styling
import { Buttons } from '../constants/Buttons';


export default function Scan() {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(true);
	const [data, setData] = useState(null);
	const [scamModalVisible, setScamModalVisible] = useState(false);
	const [successModalVisible, setSuccessModalVisible] = useState(false);
	const [alreadyValidatedModalVisible, setAlreadyValidatedModalVisible] = useState(false);
	const [notValidModalVisible, setNotValidModalVisible] = useState(false);
	const [otherOrganizationModalVisible, setOtherOrganizationModalVisible] = useState(false);

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
		return <Text>Requesting for camera permission</Text>;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
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
		
		console.log("the qr contains an uuid, checking...");
		
		try {
			const { data: supabaseData, error } = await supabase.rpc('check_qr', {qr_uuid: data})
			
			if (error) {
				throw error;
			} else {
				setData(supabaseData);
				console.log(supabaseData);

				if(supabaseData.status === 'ok') {
					setSuccessModalVisible(true);
				} else if(supabaseData.status === 'already_validated') {
					setAlreadyValidatedModalVisible(true);
				} else if(supabaseData.status === 'wrong_organization') {
					setOtherOrganizationModalVisible(true);
				} else {
					setNotValidModalVisible(true);
				}
			}
		} catch (error) {
			console.error('Error fetching data from Supabase:', error.message);
		}
	};

	return (
		<View style={styles.container}>
			<CameraView
				onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
				barcodeScannerSettings={{
					barcodeTypes: ["qr", "pdf417"],
				}}
				style={{width: 430, height: 100, flex: 1}} // Very temporary fix, i hate this fix
			/>

			<TouchableOpacity onPress={() => setScanned(false)} activeOpacity={0.8} style={[Buttons.button, { maxHeight: 250 }, scanned ? styles.buttonScanned : styles.buttonNotScanned]}>
				{ scanned ? <Text style={ Buttons.buttonText }>Scan again</Text> : <Text style={ Buttons.buttonText }>Scan...</Text> }
			</TouchableOpacity>

			<View>
				{/* Modal Components */}
        <ModalComponent
        visible={scamModalVisible}
        onClose={() => { setScamModalVisible(false); Vibration.cancel(); }}
        icon="alert-circle"
        title="Possible scam attempt"
        text="You scanned a QR code which is not by Tempqr. Please be cautious as this might be a scam attempt. Someone might have been notified about this error."
        buttonColor="red"
      />

      <ModalComponent
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        icon="checkmark-circle"
        title="Success"
        text="You scanned a valid QR code. The database has been notified and the qr has been marked as used."
        buttonColor="green"
      />

      <ModalComponent
        visible={alreadyValidatedModalVisible}
        onClose={() => setAlreadyValidatedModalVisible(false)}
        icon="arrow-undo-circle"
        title="Already Validated"
        text="You scanned an already scanned QR code. This might be positive or negative according to your implementation of TempQR."
        buttonColor="orange"
      />

      <ModalComponent
        visible={notValidModalVisible}
        onClose={() => setNotValidModalVisible(false)}
        icon="close-circle"
        title="Error"
        text="You scanned an invalid qr code. The content is plausible, but the database does not contain it. Someone might have been notified about this error."
        buttonColor="red"
      />

      <ModalComponent
        visible={otherOrganizationModalVisible}
        onClose={() => setOtherOrganizationModalVisible(false)}
        icon="business"
        title="Qr code not in your organization"
        text="You scanned a valid qr code, but it's not in your organization. Try again with another TempQr account. The qr code has not been marked as used. Someone might have been notified about this error."
        buttonColor="darkred"
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
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 22,
	},
	buttonScanned: {
		backgroundColor: 'blue',
	},
	buttonNotScanned: {
		backgroundColor: 'red',
	},
});