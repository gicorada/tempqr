import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../../utils/supabase';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Dropdown } from 'react-native-element-dropdown'
import { StackActions, useNavigation } from '@react-navigation/native';

// import hook
import { useTranslation } from "react-i18next";

// Custom styling
import { Buttons } from '../../constants/Buttons';
import { Texts } from '../../constants/Texts';
import { Inputs } from '@/constants/Inputs';


export default function Tab() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [admin, setAdmin] = useState(false)
  const [organizationUUID, setOrganizationUUID] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;
  const navigation = useNavigation();

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, [i18n]);

  const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem("language", lang);
    i18n.changeLanguage(lang);
  };


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session) {
      getProfile()
      getAdminState()
      getOrganization()
    }
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFullName(data.full_name)
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function getOrganization() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error } = await supabase.rpc('get_user_organization', {})
      if (error) {
        throw error
      }

      if (data) {
        setOrganizationUUID(data.id)
        setOrganizationName(data.name)
      }

    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function getAdminState() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error } = await supabase.rpc('is_admin_user', {})
      if (error) {
        throw error
      }

      if (data) {
        setAdmin(data)
      }

    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        updated_at: new Date(),
        full_name: fullName
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // to fix
  async function updateOrganization() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: organizationUUID,
        name: organizationName,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('organizations').update(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced]}>
        <Text style={Texts.text}>{t('settings.email')}</Text>
        <TextInput
          value={session?.user?.email}
          editable={false}
          style={Inputs.input} />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={Texts.text}>{t('settings.fullName')}</Text>
        <TextInput
          value={fullName || ''}
          onChangeText={(text) => setFullName(text)}
          style={Inputs.input} />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={Texts.text}>{t('settings.organizationUUID')}</Text>
        <TextInput
          value={organizationUUID || ''}
          editable={false}
          style={Inputs.input} />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={Texts.text}>{t('settings.organizationName')}</Text>
        <TextInput
          value={organizationName || ''}
          editable={admin}
          onChangeText={(text) => setOrganizationName(text)}
          style={Inputs.input} />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={Texts.text}>{t('language')}</Text>
        <Dropdown
          data={[{ label: 'English', value: 'en-US' }, { label: 'Italiano (Italian)', value: 'it-IT' }]}
          value={i18n.language}
          onChange={(value) => changeLanguage(value.value)}
          labelField={'label'} valueField={'value'}
          style={[Inputs.input]}
          />          
      </View>

      <View style={[styles.verticallySpaced]}>
        <TouchableOpacity
          onPress={() => { updateProfile(); updateOrganization() }}
          disabled={loading}
          style={Buttons.button}
          activeOpacity={0.8}
        >
          <Text style={Buttons.buttonText}>{loading ? t('settings.loading') : t('settings.update')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.verticallySpaced}>
        <TouchableOpacity
          onPress={() => supabase.auth.signOut()}
          style={[Buttons.button, {backgroundColor: 'red'}]}
          activeOpacity={0.8}
        >
          <Text style={Buttons.buttonText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.verticallySpaced}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(StackActions.push('ScanHistory'))}
          style={[Buttons.button]}
          activeOpacity={0.8}
        >
          <Text style={Buttons.buttonText}>{t('settings.scanHistory')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
});
