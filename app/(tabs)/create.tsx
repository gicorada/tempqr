import React, { useState } from 'react';
import { Text, View, StyleSheet, Button, Pressable } from 'react-native';
import { supabase } from '../../utils/supabase';
import QRCode from 'react-native-qrcode-svg'; 

export default function Tab() {
  const [data, setData] = useState<{ uuid: string } | null>(null);
  const [qrCreated, setQrCreated] = useState(false);
  const [qrValue, setQRValue] = useState< string | null>(null); 

  const createQRCode = async () => {
    try {
      const { data: supabaseData, error } = await supabase.rpc('add_qr');
  
      if (error) {
        throw error;
      } else {
        console.log('Data from Supabase:', supabaseData);
        alert(`QR code created with uuid ${supabaseData}`);

        setQrCreated(true);
        setQRValue(supabaseData);
      }
    } catch (error: any) {
      console.error('Error fetching data from Supabase:', error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      
      {qrCreated && qrValue ? (
        <QRCode 
        value={qrValue}
        size={250} 
        color="black"
        backgroundColor="white"
        />
      ) : <Pressable onPress={createQRCode} style={styles.button}>
          <Text style={ styles.text }>Create a new qr code</Text>
        </Pressable>}

      {qrCreated && qrValue ? (
        <Pressable onPress={createQRCode} style={[styles.button, { position: 'absolute', bottom:20 }]}>
          <Text style={ styles.text }>Create another qr code</Text>
        </Pressable>
      ) : null }

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
