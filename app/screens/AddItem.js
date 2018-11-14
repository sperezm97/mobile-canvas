import React, { Component } from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
    Platform,
    Alert
} from "react-native";

import {
    Button,
    Text,
    Form,
    Item,
    Icon,
    Input,
    Label,
    Toast,
    Root
} from "native-base";

import {
    globalStyle,
    colors,
    paddingHelpers,
} from "../config/styles";
import { changeActiveScreen } from '../actions/SessionActions';
import { connect } from 'react-redux';
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
import * as axios from 'axios'
const platform = Platform.OS;
import { VUE_APP_BASE_API_URL } from '../config/env'

class AddItem extends Component {

    constructor(props) {
        super(props);

        this.state = {
            item: {},
            itemSettings: {
                fields: [
                    {
                        name: 'firstname',
                        key: 'firstname',
                        type: 'text',
                        capitalize: true
                    },
                    {
                        name: 'lastname',
                        key: 'lastname',
                        type: 'text',
                        capitalize: true
                    },
                    {
                        name: 'email',
                        key: 'email',
                        type: 'text',
                        capitalize: false
                    },
                    {
                        name: 'phone',
                        key: 'phone',
                        type: 'phone',
                        capitalize: false
                    }
                ]
            }
        };
    }

    capitalizeFirstLetter(str) {
        var pieces = str.split(" ");
        for (var i = 0; i < pieces.length; i++) {
            var j = pieces[i].charAt(0).toUpperCase();
            pieces[i] = j + pieces[i].substr(1);
        }
        return pieces.join(" ");
    }

    createFieldStates() {
        this.state.itemSettings.fields.forEach((item) => {
            this.setState({ [item.key]: this.state.item[item.key] })
        });
    }

    createItem() {
        const { itemCreatedAction } = this.props;

        const headersData = {
            headers: { 'Authorization': this.props.token }
        };

        let data = {};

        this.state.itemSettings.fields.forEach((item) => {
            data[item.key] = this.state[item.key];
        });

        axios.post(`https://apidev.gewaer.io/v1/leads`, this.formatFormData(data), headersData)
        .then((response) => {
            itemCreatedAction();
            this.props.navigator.dismissLightBox();
        })
        .catch((error) => {
            Toast.show({
                text: error.response.data.status.message ? error.response.data.status.message : 'Error',
                buttonText: 'Ok',
                duration: 3000,
                type: 'danger'
            });
        });
    }

    componentWillMount() {
        this.createFieldStates()
    }

    formatFormData(data) {
        let formData = []
        for (let property in data) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(data[property]);
            formData.push(encodedKey + '=' + encodedValue);
        }
        formData = formData.join('&');
        return formData;
    }

    render() {
        return (
            <Root>
                <View style={{ backgroundColor: '#fff', maxHeight: deviceHeight - 30, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingVertical: 30, paddingHorizontal: 20, borderRadius: 5 }}>
                    <Icon type={'FontAwesome'} name={'user'} style={{ color: colors.brandGrey, fontSize: 42 }} />
                    <Form style={{ width: deviceWidth - 60 }}>
                        {
                            this.state.itemSettings.fields.map((item, index) => {
                                return (
                                    <Item key={item.name + '-' + index} floatingLabel last style={styles.formItem} >
                                        <Label style={[globalStyle.formLabel, { fontSize: 14, color: colors.brandBlack }]}>
                                            {this.capitalizeFirstLetter(item.name)}
                                        </Label>
                                        <Input
                                            value={this.state.firstName}
                                            autoCapitalize={item.capitalize ? 'sentences' : 'none'}
                                            onChangeText={(value) => this.setState({ [item.key]: value })}
                                        />
                                    </Item>
                                );
                            })
                        }
                        <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <Button
                                block
                                onPress={() => { this.props.navigator.dismissLightBox() }}
                                style={[styles.submitBtn, { marginTop: 30, backgroundColor: colors.brandDarkGrey, width: '45%' }]}>
                                <Text style={{ color: colors.brandWhite }}>
                                    CANCEL
                                </Text>
                            </Button>
                            <Button
                                onPress={() => this.createItem()}
                                block
                                style={[styles.submitBtn, { marginTop: 30, backgroundColor: colors.brandGreen, width: '45%' }]}>
                                <Text style={{ color: colors.brandWhite }}>
                                    ADD
                                </Text>
                            </Button>
                        </View>
                    </Form>
                </View>
            </Root>
        );
    }
}

// Stylesheet
const styles = StyleSheet.create({
    linkBTN: {
        color: colors.brandGreen,
        textDecorationLine: "underline"
    },
    submitBtn: {
        marginTop: paddingHelpers.S,
        marginBottom: paddingHelpers.S,
        borderColor: colors.brandWhite
    },
    googleBtn: {
        backgroundColor: colors.gmail,
    },
    googleText: {
        color: "#fff"
    },
    facebookBtn: {
        marginTop: paddingHelpers.S,
        marginBottom: paddingHelpers.XS,
        backgroundColor: colors.facebook,
    },
    facebookText: {
        color: "#fff"
    },
    formItem: {
        borderBottomWidth: 0.5,
    },
    titleBarContent: {
        color: colors.brandGreen,
        fontWeight: "600"
    },
    containerView: {
        marginTop: paddingHelpers.XS,
        marginBottom: paddingHelpers.XS,
    },
    containerViewBack: {
        flexGrow: 1,
        marginTop: paddingHelpers.XS,
        marginBottom: paddingHelpers.XS,
        paddingVertical: paddingHelpers.N,
        backgroundColor: colors.brandGreen,
        alignItems: 'center',
    },
    btnContainer: {
        width: 280
    },
    textContainer: {
        alignItems: "center",
        marginTop: 10,
        backgroundColor: "transparent"
    }
});

const mapStateToProps = state => {
    return {
        token: state.session.token,
        user: state.session.user,
        selectedCompanyId: state.session.selectedCompanyId,
        company: state.session.company
    };
};

export default connect(mapStateToProps, {
    changeActiveScreen
})(AddItem);