import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../utils/supabase';
import QRCode from 'react-native-qrcode-svg';

// import hook
import { useTranslation } from "react-i18next";

// Custom styling
import { Buttons } from '../../constants/Buttons';

export default function Tab() {
  const [data, setData] = useState<{ uuid: string } | null>(null);
  const [qrCreated, setQrCreated] = useState(false);
  const [qrValue, setQRValue] = useState< string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const createQRCode = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const { data: supabaseData, error } = await supabase.rpc('add_qr');
  
      if (error) {
        throw error;
      } else {
        setQrCreated(true);
        setQRValue(supabaseData);
      }
    } catch (error: any) {
      console.error('Error fetching data from Supabase:', error.message);
    } finally {
      setIsLoading(false);
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
      ) : <TouchableOpacity activeOpacity={0.8} onPress={createQRCode} disabled={isLoading} style={Buttons.button}>
          <Text style={ Buttons.buttonText }>{t('create.newQR')}</Text>
        </TouchableOpacity>}

      {qrCreated && qrValue ? (
        <TouchableOpacity activeOpacity={0.8} onPress={createQRCode} disabled={isLoading} style={[Buttons.button, { position: 'absolute', bottom:20 }]}>
          <Text style={ Buttons.buttonText }>{t('create.anotherQR')}</Text>
        </TouchableOpacity>
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
});
