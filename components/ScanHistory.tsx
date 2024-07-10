import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Vibration, Platform, ToastAndroid, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { useTranslation } from 'react-i18next';
import { Texts } from '@/constants/Texts';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-simple-toast';

export default function ScanHistory() {
  const [scans, setScans] = useState();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchScanHistory = async () => {
      const { data, error } = await supabase.rpc('validated_by_user');
      
      if (error) {
        console.error(error);
      } else {
        setScans(data);
      }
    };

    fetchScanHistory();
  }, []);

  const copyToClipboard = async (id: string) => {
    await Clipboard.setStringAsync(id);
    Vibration.vibrate(200);

    Toast.show(t('scanHistory.idCopy') + ' ' + id, Toast.SHORT);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Pressable onLongPress={() => copyToClipboard(item.id)}>
        <Text style={Texts.text}>
          <Text style={Texts.bold}>{t('scanHistory.id')} </Text>
          {item.id}
        </Text>

        {item.text ?
          <Text style={Texts.text}>
            <Text style={Texts.bold}>{t('scanHistory.text')} </Text>
            {item.text}
          </Text>
          : null}

        <Text style={Texts.text}>
          <Text style={Texts.bold}>{t('scanHistory.date')} </Text>
          {new Date(item.validated_at).toLocaleString()}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {scans ? <FlatList
        data={scans}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      /> : <Text style={[Texts.text, {textAlign: 'center', fontWeight: "bold"}]}>{t('scanHistory.noHistory')}</Text> }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  item: {
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'black',
  },
});
