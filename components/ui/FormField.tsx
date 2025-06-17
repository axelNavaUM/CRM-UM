import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  // value and onChangeText will come from TextInputProps
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  multiline,
  numberOfLines,
  autoCapitalize,
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          multiline && styles.textarea, // Apply extra height for textarea if multiline
        ]}
        placeholderTextColor="#49739c"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    // Based on HTML: flex flex-col min-w-40 flex-1 (within a wrapper that has max-w-[480px] px-4 py-3)
    marginBottom: 16, // Standard spacing between fields
    width: '100%', // Inputs should take full width of their parent container in the form
  },
  label: {
    // Based on HTML: text-[#0d141c] text-base font-medium leading-normal pb-2
    color: '#0d141c',
    fontSize: 16, // text-base
    fontWeight: '500', // font-medium
    marginBottom: 8, // pb-2 -> 0.5rem * 16px = 8px
  },
  input: {
    // Based on HTML: form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal
    borderWidth: 1,
    borderColor: '#cedbe8',
    backgroundColor: '#f8fafc', // bg-slate-50 (Tailwind slate-50 is #f8fafc)
    borderRadius: 8, // rounded-lg
    padding: 15,
    fontSize: 16, // text-base
    color: '#0d141c',
    height: 56, // h-14 -> 3.5rem * 16px = 56px
    // React Native handles focus styling differently, no direct 'focus:ring-0' or 'focus:border-[#cedbe8]'
    // We can add active border styling if needed via onFocus/onBlur state. For now, keeping it simple.
  },
  textarea: {
    height: 100, // Default height for textarea, can be adjusted with numberOfLines or specific style prop
    textAlignVertical: 'top', // Good for multiline inputs
  },
});

export default FormField;
