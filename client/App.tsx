import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  Button,
  ScrollView,
  TextInput,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native';
import MapView, { Region } from 'react-native-maps'
import { Logger } from './src/utils/Logger';
import I18n from './src/config/language';
import { getLocationCoords } from './src/service/Location';
import * as Progress from 'react-native-progress';
import { ApolloProvider } from '@apollo/react-hooks';
import { apolloClient } from './src/service/GraphQLClient';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { SAMPLE_USER_ID, GOOGLE_API_KEY } from './src/config/constants';
import { Place } from './src/model/schema';
import PlaceCard from './src/ui/PlaceCard';
console.disableYellowBox = true;
const logger = new Logger('PlaceSelector');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = 1;//width / height;
const LATITUDE_DELTA = 5;//0.002;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

type StateTypes = {
  isLoading: boolean
  loadingSuccessful: boolean
  placeId?: string
  shortName: string
  longName: string
  region: Region
  searchName: string
  isEditing: boolean
}


const loadingScreen = (text?: string) => {
  //TODO: width:SCREEN_WIDTH,height:SCREEN_HEIGHT*3/4, next version may have this.
  return <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 3 / 4, justifyContent: 'center', alignItems: 'center' }}>
    <Progress.CircleSnail style={{ justifyContent: 'center', alignItems: 'center' }} />
  </View>
}

export const errorScreen = (err: Error, message?: string) => {
  logger.error('exception occured', err);
  return <View style={{ alignItems: 'center', marginTop: 100 }}>
    <Text style={{ fontSize: 18 }}>
      Connection problem
      </Text>
  </View>;
}

export class App extends React.Component<{}, StateTypes> {
  CurrentPlaceRef: PlaceCard;
  componentDidMount = async () => {
    try {
      const { longitude, latitude } = await getLocationCoords(true);
      this.setState({
        loadingSuccessful: true,
        isLoading: false,
        region: {
          latitude,
          longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }
      })
    } catch (err) {
      logger.error('location retrieve error', err);
      this.setState({
        loadingSuccessful: false,
        isLoading: false
      })
    }
  }



  constructor(props) {
    super(props);
    this.state = {
      placeId: undefined,
      shortName: undefined,
      longName: undefined,
      isLoading: true,
      loadingSuccessful: false,
      searchName: undefined,
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      isEditing: false
    };
  }



  searchPlace = () => {
    const { searchName } = this.state;
    Keyboard.dismiss();
    if (!searchName) {
      Alert.alert('Please enter a value to searchbar');
      return;
    }
    logger.log('searchName====================' + searchName);
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + searchName + '&key=' + GOOGLE_API_KEY)
      .then((response) => response.json())
      .then((responseJson) => {
        logger.log('responseJson', responseJson)
        if (responseJson.results.length === 0) {
          Alert.alert('Address couldnt be found');
          return;
        }
        let germanyFound = false;
        for (let address_components of responseJson.results[0].address_components) {
          logger.log('address_components', address_components);
          if (address_components.short_name === 'DE') {
            germanyFound = true;
          }
        }
        if (!germanyFound) {
          Alert.alert('Address is not in Germany');
          return;
        }
        const maxLat = responseJson.results[0].geometry.bounds.northeast.lat;
        const maxLng = responseJson.results[0].geometry.bounds.northeast.lng;
        const minLat = responseJson.results[0].geometry.bounds.southwest.lat;
        const minLng = responseJson.results[0].geometry.bounds.southwest.lng;
        logger.log('maxLat=' + maxLat + ' maxLng=' + maxLng + ' minLat=' + minLat + ' minLng=' + minLng)
        const shortName = responseJson.results[0].address_components[0].short_name;
        const longName = responseJson.results[0].address_components[0].long_name;
        const latitude = (maxLat + minLat) / 2;
        const longitude = (maxLng + minLng) / 2;
        this.setState({
          shortName,
          longName,
          region: {
            latitude,
            longitude,
            latitudeDelta: (maxLat - minLat) / 2,
            longitudeDelta: (maxLng - minLng) / 2,
          },
        })
        this.CurrentPlaceRef.changePlace({ shortName, longName, latitude, longitude });

        logger.log('responseJson.address_components', responseJson.results[0].formatted_address);
        logger.log('ADDRESS GEOCODE is BACK!! => ' + JSON.stringify(responseJson));
      }).catch(err => Alert.alert('Connection problem'))
  }

  clearShortName() {
    this.setState({ shortName: undefined });
  }

  setEditing(value: boolean) {
    this.setState({ isEditing: value });
  }

  render() {

    const { shortName, longName } = this.state;
    const { latitude, longitude } = this.state.region;
    logger.debug('shortName=' + shortName);

    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ height: 50, width: SCREEN_WIDTH, marginBottom: 10, marginLeft: 10, justifyContent: 'flex-start', alignItems: 'flex-end', flexDirection: 'row' }}>
          <TextInput style={{ height: 30, width: SCREEN_WIDTH - 120, fontSize: 16, borderWidth: 1, }} value={this.state.searchName}
            onChangeText={(text) => this.setState({ searchName: text })} placeholder='Please enter a place name'>
          </TextInput>

          <TouchableOpacity style={{ width: 80, height: 30, marginLeft: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 }} onPress={() => { this.searchPlace() }}>
            <Text style={{ fontSize: 16 }}> Search</Text>
          </TouchableOpacity>

        </View>

        {this.state.isLoading ? loadingScreen() :
          this.state.loadingSuccessful ?
            <View style={{ flex: 1, flexDirection: 'row', width: SCREEN_WIDTH, height: SCREEN_WIDTH }}>
              {!this.state.isEditing ? <View style={styles.container}>
                <Query query={GET_PLACE_LIST} variables={{ userId: SAMPLE_USER_ID }} >
                  {({ loading, error, data }) => {
                    if (loading) { return loadingScreen(); } //
                    if (error) {
                      return errorScreen(error);
                    }
                    return (
                      <MapView
                        provider={'google'}
                        style={styles.map}
                        region={this.state.region}
                      //onPress={e => this.onMapPress(e)}
                      >
                        {shortName && <MapView.Marker
                          key={-1}
                          coordinate={this.state.region}
                        />}
                        {data.places.map((place: Place, i) => {
                          return <MapView.Marker
                            key={i}
                            coordinate={{
                              latitude: place.latitude,
                              longitude: place.longitude
                            }}
                          />
                        }
                        )}
                      </MapView>
                    )
                  }}
                </Query>
              </View> : <View />}
              <ScrollView style={{ marginTop: this.state.isEditing ? 0 : SCREEN_WIDTH }}>
                {shortName ? <PlaceCard app={this} ref={o => this.CurrentPlaceRef = o}
                  place={{ shortName, longName, latitude, longitude }} isNew={true} /> : <View />
                }

                <Query query={GET_PLACE_LIST} variables={{ userId: SAMPLE_USER_ID }} >
                  {({ loading, error, data }) => {
                    if (loading) { return loadingScreen(); } //
                    if (error) {
                      return errorScreen(error);
                    }
                    return (
                      <View style={{ marginTop: 30 }}>
                        {data.places.map((place: Place, i) => {
                          logger.log('data.places.length=' + data.places.length)
                          return <PlaceCard place={place} app={this} isNew={false} key={i} />
                        }
                        )}
                      </View>
                    )
                  }}
                </Query></ScrollView>

            </View>
            : <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16 }}>Map couldnt be loaded</Text>
            </View>
        }

      </View>
    );
  }
}

export const GET_PLACE_LIST = gql`       
query places($userId:ID){
  places(where:{
      user:{id:$userId}
    }
    orderBy:createdAt_ASC
    )  {
    id    
    shortName
    longName 
    latitude
    longitude
  }
}`

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    //justifyContent: 'flex-end',
    //alignItems: 'center',
    height: SCREEN_WIDTH,
    width: SCREEN_WIDTH
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  placeText: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
});


const WithProvider = () => (
  <ApolloProvider client={apolloClient}>

    <App />

  </ApolloProvider>
)

export default WithProvider;


