import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Pressable, Modal } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { validate as validateUUID } from 'uuid';
import { supabase } from '../utils/supabase';
import { Ionicons } from '@expo/vector-icons';


export default function Scan() {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(true);
	const [data, setData] = useState(null);
	const [scamModalVisible, setScamModalVisible] = useState(false);
	const [successModalVisible, setSuccessModalVisible] = useState(false);
	const [errorModalVisible, setErrorModalVisible] = useState(false);

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
		setScanned(true);
		// Check if the scanned data is a valid UUID
		if (!validateUUID(data)) {
			setScamModalVisible(true);
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

				if(supabaseData) {
					console.log(`Qr exists`);
					setSuccessModalVisible(true);
				} else {
					console.log(`Qr not exists`);
					setErrorModalVisible(true);
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
			<View>
				{/* Scam */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={scamModalVisible}
					onRequestClose={() => {
						setModalVisible(!scamModalVisible);
					}}>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Ionicons name="alert-circle" size={100} color="red" />
							<Text style={styles.modalTitle}>Possible scam attempt</Text>
							<Text style={styles.modalText}>You scanned a QR code which is not by Tempqr. Please be cautious as this might be a scam attempt</Text>
							<Text style={styles.modalText}>Someone might have been notified about this error</Text>
							<Pressable
								style={[styles.button, { backgroundColor: 'red'}]}
								onPress={() => setScamModalVisible(!scamModalVisible)}>
								<Text style={styles.text}>Hide Modal</Text>
							</Pressable>
						</View>
					</View>
				</Modal>

				{/* Success */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={successModalVisible}
					onRequestClose={() => {
						Alert.alert('Modal has been closed.');
						setModalVisible(!successModalVisible);
					}}>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Text style={styles.modalText}>Hello World!</Text>
							<Pressable
								style={[styles.button]}
								onPress={() => setSuccessModalVisible(!successModalVisible)}>
								<Text style={styles.text}>Hide Modal</Text>
							</Pressable>
						</View>
					</View>
				</Modal>

				{/* Error */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={errorModalVisible}
					onRequestClose={() => {
						Alert.alert('Modal has been closed.');
						setModalVisible(!errorModalVisible);
					}}>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Text style={styles.modalText}>Hello World!</Text>
							<Pressable
								style={[styles.button]}
								onPress={() => setErrorModalVisible(!errorModalVisible)}>
								<Text style={styles.text}>Hide Modal</Text>
							</Pressable>
						</View>
					</View>
				</Modal>
			</View>



			<TouchableOpacity onPress={() => setScanned(false)} activeOpacity={0.8} style={[styles.button, { maxHeight: 250 }, scanned ? styles.buttonScanned : styles.buttonNotScanned]}>
				 { scanned ? <Text style={ styles.text }>Scan again</Text> : <Text style={ styles.text }>Scan...</Text> }
			</TouchableOpacity>

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
  	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
		width: 0,
		height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTitle: {
		marginBottom: 15,
		textAlign: 'center',
		fontSize: 24,
		fontWeight: 'bold',
	},
	modalText: {
		marginBottom: 15,
		textAlign: 'center',
		fontSize: 20,
	},
	buttonScanned: {
		backgroundColor: 'blue',
	},
	buttonNotScanned: {
		backgroundColor: 'red',
	},
});