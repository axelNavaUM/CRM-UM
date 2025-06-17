import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// We'll need react-native-svg if we're using SVGs directly
// import { SvgXml } from 'react-native-svg';

// Placeholder for the SVG content or a simple component if using react-native-svg
const LogoSvg = () => (
  // Replace with actual SVG component or <Image> if using a PNG/JPG
  <View style={styles.logoPlaceholder}>
    <Text style={{fontSize: 10, color: '#555'}}>SVG</Text>
  </View>
);

// Define Props for the Navbar (optional for now, can be expanded)
interface NavbarProps {
  title?: string;
  userAvatarUrl?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  title = "School CRM",
  userAvatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDu9ehJf6yMAZjJYHxYxz1EGFUa1KjKEXQZwktfvD0vGw4H9YC4LgWp2IzjU0ipFV2gv4buAAMQYueyvm2wyo5OT9EvWao6bp_lxjcicSTdmHvxj6CIB167ljwKMu3fAfkI1JgWrxVRHDtJmFMb76Ef494tWO6XYWYuMqrURyUFQsmqwOU00YN_pn9eNpaN9fNwZuei77VBrHc9ruWatyzflTcVmwGPXp1zBI10OUu-Lm1z_jCLC0si9-3b3Tmwe8l9CDOl8j907r1A" // Default placeholder avatar
}) => {
  const navItems = ["Dashboard", "Students", "Courses", "Instructors", "Admissions", "Reports"];

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        <LogoSvg />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.navLinks}>
          {navItems.map((item) => (
            <TouchableOpacity key={item} onPress={() => console.log(`Navigate to ${item}`)}>
              <Text style={styles.navLinkText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Image
          source={{ uri: userAvatarUrl }}
          style={styles.avatar}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10 * 2.5, // px-10 (Tailwind uses 0.25rem steps, 10*0.25rem = 2.5rem. Assuming 1rem = 16px for RN, so 40px. Or adjust based on project scale)
                                // Let's use a more typical React Native padding like 20 or 16.
                                // For now, let's use a moderate value, e.g. 16 or 20.
                                // The HTML has px-10, which means 2.5rem * 16px/rem = 40px on each side.
                                // This is quite large for mobile. Let's use 16 for now.
    paddingHorizontal: 16,
    paddingVertical: 12, // py-3 -> 0.75rem * 16px = 12px
    borderBottomWidth: 1,
    borderBottomColor: '#e7edf4',
    backgroundColor: '#ffffff', // Assuming a white background
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // gap-4 -> 1rem * 16px = 16px
  },
  logoPlaceholder: { // size-4 -> width: 1rem, height: 1rem (16px)
    width: 16,
    height: 16,
    backgroundColor: '#ccc', // Placeholder color
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#0d141c',
    fontSize: 18, // text-lg
    fontWeight: 'bold', // font-bold
    // lineHeight: 'tight' - React Native handles line height differently, often defaults are fine.
    // tracking-[-0.015em] - letterSpacing can be used if needed.
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // To push navLinks and avatar to the end correctly
    justifyContent: 'flex-end',
    gap: 32, // gap-8 -> 2rem * 16px = 32px
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36, // gap-9 -> 2.25rem * 16px = 36px
  },
  navLinkText: {
    color: '#0d141c',
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium (React Native uses string values for fontWeight)
    // leading-normal - default line height is usually fine
  },
  avatar: { // size-10 -> width: 2.5rem, height: 2.5rem (40px)
    width: 40,
    height: 40,
    borderRadius: 20, // rounded-full for a square makes it a circle
  },
});

export default Navbar;
