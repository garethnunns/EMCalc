import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Button, IconButton, Text, TextInput } from 'react-native-paper'

import SectionHeading from './SectionHeading'
import { addSaved, describeSaved, findSaved, formatKey, parseSaved, removeSaved } from '../lib/saved'
import styles from '../style/styles'
import theme from '../style/theme'

const STORAGE_KEY = 'emcalc:saved'

const load = () => {
  try { return parseSaved(window.localStorage.getItem(STORAGE_KEY)) }
  catch { return [] }
}

const store = (list) => {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}

/**
 * Formats someone uses often, kept in this browser or desktop app
 * @param {string} query - the current inputs as a share link query
 * @param {function} onLoad - (query) => void, to switch to a saved format
 */
export default function SavedFormats({ query, onLoad }) {
  const [list, setList] = useState(load)
  const [name, setName] = useState('')

  useEffect(() => store(list), [list])

  const current = findSaved(list, query)
  const currentKey = formatKey(query)

  const save = () => {
    setList(addSaved(list, { name: name || current?.name || '', query }))
    setName('')
  }

  return (
    <View style={styles.saved}>
      <SectionHeading>Saved Formats</SectionHeading>

      <View style={styles.savedForm}>
        <TextInput
          label={current ? 'Rename this format' : 'Name (optional)'}
          placeholder={current?.name || 'e.g. Main LED wall'}
          value={name}
          onChangeText={setName}
          onSubmitEditing={save}
          returnKeyType="done"
          dense
          style={styles.savedName}
          underlineColor={theme.colors.disabled}
          maxLength={60}
          aria-label="Name for this format"
        />
        <Button
          mode="outlined"
          icon={current ? (name.trim() ? 'content-save-edit-outline' : 'content-save-check-outline') : 'content-save-outline'}
          uppercase={false}
          onPress={save}
          disabled={!!current && !name.trim()}
        >
          {current ? (name.trim() ? 'Rename' : 'Saved') : 'Save'}
        </Button>
      </View>

      {list.length === 0 ? (
        <Text style={styles.savedEmpty}>
          Save formats you use often, like an LED wall, to get back to them in one tap.
        </Text>
      ) : (
        <View role="list" aria-label="Saved formats">
          {list.map(item => {
            const { format, detail } = describeSaved(item.query)
            const active = formatKey(item.query) === currentKey
            return (
              <View key={item.query} role="listitem" style={[styles.savedItem, active && styles.savedItemActive]}>
                <Pressable
                  onPress={() => onLoad(item.query)}
                  role="button"
                  style={styles.savedLoad}
                  aria-label={`Use ${item.name || format}`}
                  aria-current={active || undefined}
                >
                  <Text style={styles.savedTitle} numberOfLines={1}>{item.name || format}</Text>
                  <Text style={styles.savedDetail} numberOfLines={1}>
                    {item.name ? `${format} · ${detail}` : detail}
                  </Text>
                </Pressable>
                <IconButton
                  icon="close"
                  size={18}
                  iconColor={theme.colors.textDark}
                  onPress={() => setList(removeSaved(list, item.query))}
                  accessibilityLabel={`Remove ${item.name || format}`}
                />
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}
