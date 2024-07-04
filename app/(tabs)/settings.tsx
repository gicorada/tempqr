import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../../utils/supabase';
import { Session } from '@supabase/supabase-js'

export default function Tab() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [admin, setAdmin] = useState(false)
  const [organizationUUID, setOrganizationUUID] = useState('')
  const [organizationName, setOrganizationName] = useState('')

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
      <View style={styles.verticallySpaced}>
        <Text style={styles.text}>Organization Name</Text>
        <TextInput
          value={organizationName || ''}
          editable={admin}
          onChangeText={(text) => setOrganizationName(text)}
          style={styles.input} />
      </View>

      <View style={[styles.verticallySpaced]}>
        <TouchableOpacity
          onPress={() => { updateProfile(); updateOrganization() }}
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
