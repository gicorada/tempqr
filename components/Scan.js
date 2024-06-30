import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { validate as validateUUID } from 'uuid';
import { supabase } from '../utils/supabase';

export default function Scan() {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(true);
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
		// Check if the scanned data is a valid UUID
		if (!validateUUID(data)) {
			// Might do something to alert the user of a possible scam attempt, but for now just return
			return;
		}
		
		console.log("the qr contains an uuid, checking...");
		setScanned(true);
		
		
		try {
			const { data: supabaseData, error } = await supabase.rpc('check_qr', {qr_uuid: data})
			
			if (error) {
				throw error;
			} else {
				setData(supabaseData);
				console.log(supabaseData);

				if(supabaseData) {
					alert(`Qr exists`);
				} else {
					alert(`Qr not exists`);
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


			<Pressable onPress={() => { setScanned(false); console.log("attivato"); }} style={[styles.button, { maxHeight: 250 }]}>
				 { scanned ? <Text style={ styles.text }>Scan again</Text> : <Text style={ styles.text }>Scan...</Text> }
			</Pressable>

		</View>
	);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});