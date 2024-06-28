import React, { useState } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
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
      <Button title='Create a new qr code' onPress={createQRCode} />
      {qrCreated && qrValue ? (
        <QRCode 
          value={qrValue}
          size={200} 
          color="black"
          backgroundColor="white"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
