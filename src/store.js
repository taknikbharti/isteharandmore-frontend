import { createStore } from 'vuex';

export default createStore({
  state: {
    responseData: null,
  },
  mutations: {
    setResponseData(state, data) {
      state.responseData = data;
    },
  },
});
