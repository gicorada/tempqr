import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../../utils/supabase';
import { Session } from '@supabase/supabase-js'

// to fix
export default function Tab() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [organizationUUID, setOrganizationUUID] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session) getProfile()
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

      const { data: userOrg, error: errorOrg } = await supabase.rpc('get_user_organization', {})

      if (data && userOrg) {
        setFullName(data.full_name)
        setOrganizationUUID(userOrg)
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(full_name: string) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        updated_at: new Date(),
        full_name: full_name
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

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced]}>
        <Text style={styles.text}>Email</Text>
        <TextInput
          value={session?.user?.email}
          editable={false}
          style={styles.input} />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.text}>Full Name</Text>
        <TextInput
          value={fullName || ''}
          onChangeText={(text) => setFullName(text)}
          style={styles.input} />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.text}>Organization UUID</Text>
        <TextInput
          value={organizationUUID || ''}
          editable={false}
          style={styles.input} />
      </View>

      <View style={[styles.verticallySpaced]}>
        <TouchableOpacity
          onPress={() => updateProfile(fullName)}
          disabled={loading}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{loading ? 'Loading ...' : 'Update'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.verticallySpaced}>
        <TouchableOpacity
          onPress={() => supabase.auth.signOut()}
          style={[styles.button, {backgroundColor: 'red'}]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
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
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    height: 40,
    marginVertical: 12,
    borderRadius: 4,
    elevation: 2,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
});
