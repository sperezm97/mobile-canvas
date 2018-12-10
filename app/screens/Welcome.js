// Importing package modules.
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as axios from 'axios';

import { 
    StyleSheet,
    View,
    StatusBar,
    ImageBackground,
    AsyncStorage,
    Alert,
} from "react-native";

import {
    Text,
    Button,
    Container,
    Spinner
} from "native-base";

// Importing local assets.
import { 
	globalStyle, 
	colors, 
	paddingHelpers 
} from "../config/styles";
import { appImages } from "../config/imagesRoutes";
import { VUE_APP_BASE_API_URL } from '../config/env'

// Importing Redux's actions
import {
	changeActiveScreen,
	changeSessionToken,
	changeUser,
	changeActiveCompany
} from '../actions/SessionActions';

/*
	Screen Name: Welcome. 
	Description: This is the first screen that the user will see if there's not session data in the storage. 
	It usually contains the company logo and navigation buttons to the Register or Log In screen.
*/
class Welcome extends Component {

    constructor(props) {
        super(props);

        this.state = { 
            isLoading: false 
		};
		
		// Deactivates yellow warning box.
        console.disableYellowBox = true;
    }

    componentWillMount() {
        //this.handleSessionData();
	}
	
	// Verifies if there's any session data on the local storage.
    // This is used to auto-login the user if the token is not expired.
	async handleSessionData() {
		let data = JSON.parse(await AsyncStorage.getItem('sessionData'));
		if (data && data.token && data.id) {
			// Sets session's token in redux state.
			this.props.changeSessionToken({ token: data.token });
			this.getUserInfo(data.id, data.token);
		} else {
			this.setState({ isLoading: false })
		}
	}

	// Removes any session data in the local storage.
    async removeSessionData() {
        try {
            await AsyncStorage.removeItem('sessionData');
        } catch (error) {
            console.error('AsyncStorage error: ' + error.message);
        }
    }

	// Tries to get the user's information using the stored token.
	// If the response is an error then the token is expired and removes the session data.
    getUserInfo(userId, token) {
        const data = {
            'Authorization': token,
        };
        axios.get(`${VUE_APP_BASE_API_URL}/users/${userId}`, { headers: data })
        .then((response) => {
			// Sets user's data in redux state.
            this.props.changeUser({ user: response.data });
            this.getUserDefaultCompany(response.data.default_company, token);
        })
        .catch((error) => {
            console.log(error.response);
            debugger;
            Alert.alert("Sesión expirada");
            this.removeSessionData();
            this.setState({ isLoading: false })
        });
    }

	// Get the user's default company.
    getUserDefaultCompany(companyId, token) {
        const data = {
            'Authorization': token,
        };
        axios.get(`${VUE_APP_BASE_API_URL}/companies?q=(id:${companyId})`, { headers: data })
        .then((response) => {
			// Sets user's active company in redux state.
			this.props.changeActiveCompany({ company: response.data[0] });
			// Since all user and session data are in the redux's state, change to Dashboard screen.
            this.changeScreen('dashboard');
        })
        .catch(function (error) {
            console.log(error);
        });
    }

	// Changes the active screen using redux.
    changeScreen(activeScreen) {
        this.props.changeActiveScreen({ activeScreen });
    }
	
	// Pushes to another screen in the navigator stack.
    pushScreen(activeScreen) {
        this.props.navigator.push({
            screen: activeScreen,
            navigatorStyle: {
                navBarHidden: true,
                tabBarHidden: true,
            },
        });
    }

    render() {
		// Displays a loading spinner if the app is loading.
        if (this.state.isLoading) {
            return (
                <Container style={[styles.wrapper, { justifyContent: 'center', alignItems: 'center' }]}>
                    <StatusBar backgroundColor={colors.brandGreen} barStyle="light-content" />
                    <View style={{justifyContent: 'center', alignItems: 'center' }}>
                        <Spinner color={colors.brandPrimary} />
                    </View>
                </Container>
            );
        } else {
            return (
                <Container style={styles.wrapper}>
                    <StatusBar backgroundColor={colors.brandGreen} barStyle="light-content" />
						<View>
							<View style={styles.container}>
								<View>
									<ImageBackground 
										source={appImages.LogoBig.uri} 
										style={globalStyle.logoBig} 
										resizeMode='contain'
									/>
								</View>
							</View>
							<View style={styles.footerButtomsContainer}>
								<Text style={{marginBottom: paddingHelpers.S, fontWeight:'200'}}>
									Inicia Sesión con tus Cuentas de Social Media
								</Text>
								<Button
									block
									style={{ marginVertical: paddingHelpers.S, backgroundColor: colors.bradSecondaryAlter }}
									onPress={() => this.pushScreen('dac.Login')}>
									<Text style={styles.btnTextStyle}>
										Ingresar
									</Text>
								</Button>
								<Button
									block
									style={{ marginVertical: paddingHelpers.S, backgroundColor: colors.brandPrimary }}
									onPress={() => this.pushScreen('dac.Register')}>
									<Text style={styles.btnTextStyle}>
										Crear Cuenta
									</Text>
								</Button>
							</View>
						</View>
                </Container>
            );
        }
    }
}

// Stylesheet
const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: colors.brandWhite
    },
    container: {
        flexShrink: 1,
        backgroundColor: colors.brandSecondary,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
    },
    footerButtomsContainer: {
        flexGrow: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: paddingHelpers.N,
        paddingTop: paddingHelpers.N,
        backgroundColor: colors.brandWhite
	},
	btnTextStyle: {
		fontSize: 16, 
		color: '#fff'
	}
});

// Maps redux's state variables to this class' props
const mapStateToProps = state => {
    return {};
};

// Connects redux actions to this class' props
export default connect(mapStateToProps, {
	changeActiveScreen, 
	changeSessionToken, 
	changeUser, 
	changeActiveCompany
})(Welcome);