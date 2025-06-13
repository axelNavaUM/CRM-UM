import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function Logo(){
    return(
        <View style={stylesLogo.wrapper}>
            <Image source={require('../../assets/images/gorro-de-graduacion.png')} style={stylesLogo.icon}/>

        </View>
    );
}

const stylesLogo = StyleSheet.create({
    wrapper: {
        width: 16,
        height: 16,
      },
      icon: {
        width: '100%',
        height: '100%',
      },
});