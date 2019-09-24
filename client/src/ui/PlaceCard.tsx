//import liraries
import React from 'react';
import { Component } from 'react';
import { View, Text, Dimensions, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView } from 'react-native'; //ImageSourcePropType
import { Card, CardItem, Body, } from 'native-base';
import { Logger } from '../utils/Logger';
import gql from 'graphql-tag';
import { apolloClient } from './../service/GraphQLClient';
import { GET_PLACE_LIST, App } from '../../App';
import { SAMPLE_USER_ID } from '../config/constants';
import { Place } from '../model/schema';


const SCREEN_WIDTH = Dimensions.get('window').width;
//const SCREEN_HEIGHT = Dimensions.get('window').height;

// create a component
const logger: Logger = new Logger('PlaceCard');

type Props = {
    placeId: string
    shortName: string
    longName: string
    latitude: number
    longitude: number
}


export default class PlaceCard extends Component<{ place: Place, isNew: boolean, app?: App }, Props> { //

    constructor(props) {
        super(props);
        const { shortName, longName, latitude, longitude, id } = this.props.place;
        this.state = {
            shortName,
            longName,
            latitude,
            longitude,
            placeId: id
        }
        logger.log('PlaceCard.constructor', this.state.shortName);
    }

    render() {
        logger.log('PlaceCard.shortName', this.state.shortName);
        return (<Card style={{ marginTop: 5, width: SCREEN_WIDTH, height: 70 }} >

            <CardItem style={{ width: SCREEN_WIDTH, height: 70, borderBottomWidth: 1, borderColor: 'rgba(230,230,230,1)' }}>

                <Body style={{ width: SCREEN_WIDTH, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'column', width: 2 * SCREEN_WIDTH / 3, justifyContent: 'center', alignItems: 'center' }}>
                            <TextInput style={{ fontSize: 24, fontWeight: 'bold', color: 'blue', borderWidth: 1, borderColor: 'rgb(150,150,150)' }}
                                onTouchEnd={() => {
                                    this.props.app.setEditing(true);
                                }}
                                onChangeText={(text) => {
                                    this.setState({ shortName: text })
                                }
                                }
                            >{this.state.shortName}</TextInput>
                            <TextInput style={{ fontSize: 12, borderWidth: 1, borderColor: 'rgb(150,150,150)' }}
                                onTouchEnd={() => {
                                    this.props.app.setEditing(true);
                                }}
                                onChangeText={(text) => {
                                    this.setState({ longName: text })
                                }
                                }
                            >{this.state.longName}</TextInput>
                            <View style={{ flexDirection: 'row' }}>
                                <Text>Latitude: </Text>
                                <TextInput style={{ fontSize: 12, borderWidth: 1, borderColor: 'rgb(150,150,150)', }} value={this.state.latitude.toString()}
                                    onTouchEnd={() => {
                                        this.props.app.setEditing(true);
                                    }}
                                    onChangeText={(text) => {
                                        this.setState({ latitude: parseFloat(text) })
                                    }
                                    }
                                ></TextInput>
                            </View>

                            <View style={{ flexDirection: 'row' }}>
                                <Text>Longitude: </Text>
                                <TextInput style={{ fontSize: 12, borderWidth: 1, borderColor: 'rgb(150,150,150)', }} value={this.state.longitude.toString()}
                                    onTouchEnd={() => {
                                        this.props.app.setEditing(true);
                                    }}
                                    onChangeText={(text) => {
                                        this.setState({ longitude: parseFloat(text) })
                                    }
                                    }
                                ></TextInput>
                            </View>
                        </View>


                        {!this.props.isNew ? <View style={{ width: SCREEN_WIDTH / 3, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => this.updatePlace()}>
                                <Text style={{ fontSize: 20, borderWidth: 1 }}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.deletePlace()}>
                                <Text style={{ fontSize: 20, borderWidth: 1, marginTop: 10 }}>Delete</Text>
                            </TouchableOpacity>
                        </View> :
                            <View style={{ width: SCREEN_WIDTH / 3, justifyContent: 'center', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => this.createPlace()}>
                                    <Text style={{ fontSize: 20, borderWidth: 1 }}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </Body>
            </CardItem>
        </Card>
        );
    }

    changePlace = (place: Place) => {
        this.setState({
            shortName: place.shortName,
            longName: place.longName,
            latitude: place.latitude,
            longitude: place.longitude
        })
    }

    createPlace = () => {
        const { shortName, longName, latitude, longitude } = this.state;
        logger.log('createPlace.shortName=' + shortName);
        apolloClient.mutate({
            mutation: CREATE_PLACE,
            variables: {
                shortName,
                longName,
                latitude,
                longitude,
                userId: SAMPLE_USER_ID
            },
            refetchQueries: [{
                query: GET_PLACE_LIST,
                variables: {
                    userId: SAMPLE_USER_ID,
                },
            }
            ]
        }).then(res => {
            /*this.props.app.setState({region:{
                latitude, 
                longitude,
                latitudeDelta:10,
                longitudeDelta:10
            }})*/
            this.props.app.setState({
                searchName: undefined,
                shortName: undefined,
                isEditing: false
            })
        }).catch(err => {
            Alert.alert('Connection Problem');
            logger.log('createPlace err', err);
        })
    }

    updatePlace = () => {
        const { shortName, longName, latitude, longitude } = this.state;
        apolloClient.mutate({
            mutation: UPDATE_PLACE,
            variables: {
                id: this.props.place.id,
                shortName,
                longName,
                latitude,
                longitude,
            },
            refetchQueries: [{
                query: GET_PLACE_LIST,
                variables: {
                    userId: SAMPLE_USER_ID,
                },
            }
            ]
        }).then(res => {
            /*this.props.app.setState({region:{
                latitude, 
                longitude,
                latitudeDelta:10,
                longitudeDelta:10
            }})*/
            if (this.props.app.state.isEditing) {
                this.props.app.setState({
                    isEditing: false
                })
            }
        }).catch(err => {
            Alert.alert('Connection Problem');
            logger.log('UpdatePlace err', err);
        })
    }

    deletePlace = () => {
        apolloClient.mutate({
            mutation: DELETE_PLACE,
            variables: {
                id: this.props.place.id,
            },
            refetchQueries: [{
                query: GET_PLACE_LIST,
                variables: {
                    userId: SAMPLE_USER_ID,
                },
            }
            ]
        }).then(res => {
            if (this.props.app.state.isEditing) {
                this.props.app.setState({
                    isEditing: false
                })
            }
        }).catch(err => {
            Alert.alert('Connection Problem');
            logger.log('delete err', err);
        })
    }


}


const CREATE_PLACE = gql`
mutation createPlace($shortName:String,$longName:String,$latitude:Float,$longitude:Float,$userId:ID!){
    createPlace(      
      data:{
        shortName:$shortName
        longName:$longName
        latitude:$latitude
        longitude:$longitude
        user:{ connect:{id:$userId}
    }
      }
    ){
     id     
    }
}`


const UPDATE_PLACE = gql`
mutation updatePlace($id:ID,$shortName:String,$longName:String,$latitude:Float,$longitude:Float){
    updatePlace(
        where:{
            id:$id
        }
      data:{
        shortName:$shortName
        longName:$longName
        latitude:$latitude
        longitude:$longitude
      }
    ){
     id     
    }
}`


const DELETE_PLACE = gql`
mutation deletePlace($id:ID){
    deletePlace(
        where:{
            id:$id
        }      
    ){
     id     
    }
}`
