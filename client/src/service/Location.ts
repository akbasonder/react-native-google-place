import { Platform, AsyncStorage } from 'react-native';
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { Logger } from '../utils/Logger';
import { LATITUDE, LONGITUDE } from '../config/constants';

const logger = new Logger('LocationJob');
let lastTaskExecutionTime: number = 0;

export const getLocationAsync = async () => { //async
  try {

    logger.info('getLocation service started.');
    if (Platform.OS === 'android' && !Constants.isDevice) {
      throw new Error('Oops, this will not work on Sketch in an Android emulator. Try it on your device!');
    }
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    logger.info('getLocation status.', status);
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }
    let location = await Location.getCurrentPositionAsync({}); // await , LocationInterface
    logger.info('location=', location);
    if (location.coords) {
      AsyncStorage.setItem(LATITUDE, location.coords.latitude.toString());
      AsyncStorage.setItem(LONGITUDE, location.coords.longitude.toString());      
    }
    return location;

  } catch (e) {
    logger.error('getLocation service error', e);
    return null;
  }
}

export const getLocationCoords = async (liveLocation?: boolean) => {
  logger.debug('getLocationCoords liveLocation=' + liveLocation);
  if (liveLocation) {
    const location = await getLocationAsync();
    if (location && location.coords) {
      const { longitude, latitude } = location.coords;      
      return { longitude, latitude };
    } else {
      return await getStoredLocation();
    }
  }
  else {
    return await getStoredLocation();
  }
}

export const getStoredLocation = async () => {
  try {
    const lat: string = await AsyncStorage.getItem(LATITUDE);
    const lng: string = await AsyncStorage.getItem(LONGITUDE);
    logger.debug('lat=' + lat);
    const latitude: number = lat ? parseFloat(lat) : 0;
    const longitude: number = lng ? parseFloat(lng) : 0;
    logger.debug('latitude=' + lat);
    return { latitude, longitude };
  } catch (e) {
    return { latitude: 0, longitude: 0 };
  }

}
