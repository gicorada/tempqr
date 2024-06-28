import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { validate as validateUUID } from 'uuid';
import { supabase } from '../utils/supabase';

export default function Scan() {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(false);
	const [data, setData] = useState(null);

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
		console.log("scanned but not checked yet");
		setScanned(true);
		
		// Check if the scanned data is a valid UUID
		if (!validateUUID(data)) {
			alert('Invalid QR Code');
			console.log("The content of the qr code is not an UUID");
			return;
		}

		alert(`Bar code with type ${type} and data ${data} has been scanned!`);
		
		try {
			const { data: supabaseData, error } = await supabase
				.from('qr')
				.select('created_at, text')
				.eq('id', data)
				.limit(1);

			if (error) {
				throw error;
			} else {
				console.log("the qr code \"", supabaseData[0].text, "\" was created on ", supabaseData[0].created_at);
				
			}
		} catch (error) {
			console.error('Error fetching data from Supabase:', error.message);
		}
	};

	return (
		<View>
		  <CameraView
			onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
			barcodeScannerSettings={{
			  barcodeTypes: ["qr", "pdf417"],
			}}
			style={{width: 500, height: 100, flex: 1}} // Very temporary fix, i hate this fix
		  />
		  {scanned && (
			<Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
		  )}
		</View>
	);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});