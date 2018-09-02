import { NavigationActions} from 'react-navigation'

let _navigation

function setTopLevelNavigator(navigatorRef) { 
	_navigation = navigatorRef
}

function navigate(routeName, params) {
	_navigation.dispatch(
		NavigationActions.navigate({
			routeName,
			params
		})
	)
}

export default {
	navigate,
	setTopLevelNavigator
}