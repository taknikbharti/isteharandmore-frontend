  <template>
    <div class="main-div">
      <div class="main-card">
        <div class="card shadow-sm">
          <div class="card-header">
            <h3 class="card-title mt-3">Login</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label for="getUsername">User Name</label>
              <input v-model="username" type="text" id="getUsername" placeholder="User Name" />
            </div>
            <div class="form-group mt-3">
              <label for="getPassword">Password</label>
              <input v-model="password" type="password" id="getPassword" placeholder="Password" />
            </div>
            <div class="form-group mt-3">
              <label for="getScreen">Screen no.</label>
              <input v-model="screen" type="text" id="getScreen" placeholder="Screen no" />
            </div>
            <button @click="check" class="btn-primary mt-4">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
  import axios from 'axios';
  import { useStore } from 'vuex';

  export default {
    data() {
      return {
        username: '',
        password: '',
        screen: ''
      };
    },

    methods: {
      check() {
        // axios.post('http://localhost:8000/api/business/login', {
        axios.post('https://isteharandmore.com/api/business/login', {
          username: this.username,
          password: this.password,
          screen: this.screen
        })
          .then(({ data }) => {
            alert(data.message);
            console.log(data)
            if (data.status === true) {
            this.$store.commit('setResponseData', data.data);
            this.$router.push({ name: 'about' });
          }
          })
          .catch(error => {
            alert(error.message);
          });
      }
    }
  };
  </script>

  <style scoped>
  html, body {
    margin: 0;
    overflow: hidden;
    height: 100%;
  }

  .main-div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    overflow: hidden;
  }

  .main-card {
    width: 70%;
    max-width: 500px;
    padding: 30px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  .card-header {
    background-color: #f4f4f4;
    padding: 15px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .card-title {
    margin: 0;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .btn-primary {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
  }

  .btn-primary:hover {
    background-color: #0056b3;
  }
  input{
    /* font-size: 15px; */
    margin-left: 20px;
  }
  </style>
