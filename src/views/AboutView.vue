<template>
  <!-- <button @click="next">Slide to the next slide</button> -->
  <div class="about">
    <swiper
      :slides-per-view="1"
      @swiper="onSwiper"
      @slideChange="adSwipe"
      :style="{ height: '100vh' }"
    >
    <swiper-slide v-for="(file, index) in files" :key="index">
        <template v-if="file.type === 'image'">
          <img :src="file.path" class="swiper-image" alt="Image" />
        </template>
        <template v-else-if="file.type === 'video'">
          <video
            @ended="videoEnded"
            ref="videoPlayer"
            controls
            class="swiper-video"
            @loadedmetadata="playVideo(index)"
          >
            <source :src="file.path" type="video/mp4" />
          </video>
        </template>
      </swiper-slide>
    </swiper>
  </div>
</template>
<script>
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  created() {
    console.log('created component')
    // Check if the local storage database is created, if not, create one
    if (!localStorage.getItem('ishtehar_db')) {
      localStorage.setItem('ishtehar_db', JSON.stringify([]));
    }
    this.primaryKey = parseInt(localStorage.getItem('lastPrimaryKey')) || 1;
    this.responseData = this.$store.state.responseData;
    console.log('created')
    console.log(this.responseData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.responseData.token}`
    this.getAd();
  },
  data() {
    return {
      responseData: null,
      files: [],
      currentIndex: 0,
      swiper: null,
      interval: 5000,
      primaryKey: 1,
    };
  },

  methods: {
    getAd() {
      axios
        .get('http://localhost:8000/api/ads',)
        .then(({ data }) => {
          console.log(`response data ${data.files}`);
          this.files = data.files || [];
        })
        .catch((error) => {
          alert(error.message);
        });
    },

    next() {
      this.swiper.slideNext();
    },

  //auto call when swiper load 
    onSwiper(swiper) {
      this.swiper = swiper;
      console.log('Swiper initialized');
      // this.storeDb();
      console.log(this.files[0]);
      this.swipeNow();
    },

    adSwipe(swiper) {
      console.log(`next method adswiper`);
      console.log(this.files[(swiper.activeIndex - 1)].path)
      this.storeDb();
      if (this.files[swiper.activeIndex].type == 'video') {
        this.playVideo(swiper);
      }else if (this.files[swiper.activeIndex].type == 'image') {       
          this.swipeNext();
      }  
    },

    swipeNow () {
      if(this.files[this.swiper.activeIndex]){
        this.swiper.slideNext()
      }else {
        // console.log(`here swipeNow is called with else `)
        //   console.log(`if first item is image`);
            setTimeout(() => {
            this.swiper.slideNext()
          }, this.interval);
      }
    },

    swipeNext () {
      setTimeout(() => {
        this.swiper.slideNext()
      }, this.interval);
    },

    playVideo(swiper) {
      if (this.files[swiper.activeIndex].type == 'video') {
        let videoPlayer = this.$refs.videoPlayer;
      if (videoPlayer && videoPlayer[this.currentIndex].duration) {
        videoPlayer[this.currentIndex].autoplay = true;
        videoPlayer[this.currentIndex].muted = false;
        videoPlayer[this.currentIndex].play();
      }
    }
},
// auto call when video completed
videoEnded() {
  let videoPlayer = this.$refs.videoPlayer;
  videoPlayer[this.currentIndex].autoplay = false;
  videoPlayer[this.currentIndex].muted = true;
  this.currentIndex += 1;
  this.swipeNow();
},
//getting the time of running ad
getRunningSeconds(index) {
        console.log(`get running sec. ${this.files[(this.swiper.activeIndex - 1)].type}`);
// if video then wait at the time of video duration
      if (this.files[index].type == 'video') {
        let videoPlayer = this.$refs.videoPlayer;
        return videoPlayer ? videoPlayer[(this.currentIndex - 1)].duration : 0;
      }
// Default for images  
      return 5;
    },
storeDb () {
   const logs = JSON.parse(localStorage.getItem('ishtehar_db')) || [];

if (logs.length < 1000) {
  const log = {
    primery_key: this.primaryKey++,
    ad_id: this.files[(this.swiper.activeIndex - 1)].id,
    running_seconds: this.getRunningSeconds((this.swiper.activeIndex - 1)),
    timestamp: new Date().toISOString(),
  };
  logs.push(log);

  localStorage.setItem('ishtehar_db', JSON.stringify(logs));

  localStorage.setItem('lastPrimaryKey', this.primaryKey);
} else {
  console.log("api called")
  this.sendLogsToApi(logs);
  localStorage.setItem('ishtehar_db', JSON.stringify([]));
}
},
sendLogsToApi(logs) {
    axios
        .post('http://localhost:8000/api/ad_running_data', { logs }, { headers: { 'Content-Type': 'application/json' } })
        .then((response) => {
            console.log('Logs sent to the API:', response.data.message, response.data.logs);
        })
        .catch((error) => {
            console.error('Error sending logs to the API:', error.message);
        });
},

  },
};
</script>

<style>
body,
html,
.about {
  margin: 0;
  padding: 0;
  height: 100%;
}

.about {
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper-image,
.swiper-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.swiper-scrollbar {
  display: none;
}
</style>
