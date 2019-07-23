import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import thunk from 'redux-thunk';

const composeEnhancers =
    process.env.NODE_ENV === 'development' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
        : compose;

const enhancer = composeEnhancers(applyMiddleware(thunk));

const staticReducers = {
};

const createReducer = (asyncReducers) => {
    return combineReducers({
        ...staticReducers,
        ...asyncReducers,
    });
};

const configureStore = () => {
    const store = createStore(createReducer(), enhancer);

    // Add a dictionary to keep track of the registered async reducers
    store.asyncReducers = {};

    // Create an inject reducer function
    // This function adds the async reducer, and creates a new combined reducer
    store.injectReducer = (key, asyncReducer) => {
        if (!store.asyncReducers[key]) {
            store.asyncReducers[key] = asyncReducer;
            store.replaceReducer(createReducer(store.asyncReducers));
        }
    };

    // Return the modified store
    return store;
};

export default configureStore();