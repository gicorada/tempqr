import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../utils/supabase';
import { useTranslation } from 'react-i18next';
import { Texts } from '@/constants/Texts';

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

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={scans}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
