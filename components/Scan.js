import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from "react-native";
import { CameraView, Camera } from "expo-camera";
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

	const handleBarCodeScanned = async ({ type, data }) => {
		setScanned(true);
		alert(`Bar code with type ${type} and data ${data} has been scanned!`);
		
		try {
		const { data: supabaseData, error } = await supabase
			.from('qr')
			.select('*');

		if (error) {
			throw error;
		} else {
			console.log(supabaseData);
		}
		} catch (error) {
		console.error('Error fetching data from Supabase:', error.message);
		// Gestione dell'errore: mostra un messaggio all'utente o gestisci diversamente
		}
	};

	if (hasPermission === null) {
		return <Text>Requesting for camera permission</Text>;
	}
	if (!hasPermission) {
		return <Text>No access to camera</Text>;
	}

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
		<CameraView
			onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
			barcodeScannerSettings={{
			barcodeTypes: ["qr", "pdf417"],
			}}
			style={StyleSheet.absoluteFillObject}
		/>
		{scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
		{data && <Text>Data from QR code: {data}</Text>}
		</View>
	);
}