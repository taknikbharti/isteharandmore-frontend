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
        <template v-if="isImage(file)">
          <img :src="getUrl(file)" class="swiper-image" alt="Image" />
        </template>
        <template v-else-if="isVideo(file)">
          <video
            @ended="videoEnded"
            ref="videoPlayer"
            controls
            class="swiper-video"
            @loadedmetadata="playVideo"
          >
            <source :src="getUrl(file)" type="video/mp4" />
          </video>
        </template>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script>
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css'; // Import Swiper styles
// import 'swiper/css/autoplay';
// import 'swiper/css/scrollbar';

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  created() {
    // Check if the local storage database is created, if not, create one
    if (!localStorage.getItem('ishtehar_db')) {
      localStorage.setItem('ishtehar_db', JSON.stringify([]));
    }

    // Retrieve the last used primary key from localStorage or default to 1
    this.primaryKey = parseInt(localStorage.getItem('lastPrimaryKey')) || 1;
    this.responseData = this.$store.state.responseData;
    this.type = this.responseData.business_id ? 'Branch' : 'Business';
    this.id = this.responseData.id;
    console.log('created')
    this.getAd(this.id, this.type);
  },
  data() {
    return {
      responseData: null,
      files: [],
      id: [],
      currentIndex: 0,
      swiper: null,
      interval: 5000,
      primaryKey: 1,
    };
  },
  methods: {
    getAd(id, type) {
      axios
        .post('https://isteharandmore.com/api/ads', { id, type })
        .then(({ data }) => {
          this.files = data.files || [];
          this.id = data.id || [];
          if (this.files.length > 0) {
            console.log(this.files);
          }
        })
        .catch((error) => {
          alert(error.message);
        });
    },
    isImage(file) {
      return /\.(jpg|jpeg|png|gif)$/i.test(file);
    },
    isVideo(file) {
      return /\.(mp4)$/i.test(file);
    },
    getUrl(file) {
      return `https://istehar-bucket.s3.ap-south-1.amazonaws.com/${file}`;
    },
    next() {
      this.swiper.slideNext();
    },
    // prev() {
    //   this.swiper.slidePrev();
    //   this.currentIndex -= 1;
    // },
    onSwiper(swiper) {
      this.swiper = swiper;
      console.log('Swiper initialized');
      this.storeDb();
      // console.log(this.isImage(this.files[swiper.activeIndex]));
      this.swipeNow();
    },
    adSwipe(swiper) {
      console.log(this.files)
      console.log(this.id[swiper.activeIndex])
      this.storeDb();
      if (this.isVideo(this.files[swiper.activeIndex])) {
        console.log(`video start ${swiper.activeIndex}`)
        this.playVideo(swiper);
      }else if (this.isImage(this.files[swiper.activeIndex])) {       
          this.swipeNext();
      }  
    },
    swipeNow () {
      if(this.files[this.swiper.activeIndex]){
        this.swiper.slideNext()
      }else {
        setTimeout(() => {
          this.swiper.slideNext()
      }, this.interval);
      }
      // this.swiper.slideTo(0)
    },
    swipeNext () {
      console.log(`swipeNext() called`)
      setTimeout(() => {
        this.swiper.slideNext()
      }, this.interval);
      // this.adSwipe(swiper)
    },
    // swipeNext () {
    //   this.currentInterval = setInterval(() => {
    //     this.swiper.slideNext();
    //   }, this.interval)
    // },
    playVideo(swiper) {
      if (this.isVideo(this.files[swiper.activeIndex])) {
       console.log(`playvideo() called`);
        let videoPlayer = this.$refs.videoPlayer;

    if (videoPlayer && videoPlayer[this.currentIndex].duration) {
      console.log(`video start ${this.interval}`);
      videoPlayer[this.currentIndex].autoplay = true;
      videoPlayer[this.currentIndex].muted = false;
      console.log('Video started');
      videoPlayer[this.currentIndex].play();
    }
  }
},
videoEnded() {
  let videoPlayer = this.$refs.videoPlayer;
  console.log(`video end`);
  videoPlayer[this.currentIndex].autoplay = false;
  videoPlayer[this.currentIndex].muted = true;
  // this.interval = 5000;
  this.currentIndex += 1;
  this.swipeNow();
  // // clearInterval(this.currentInterval);
  // this.currentInterval = setInterval(() => {
    // this.swiper.slideNext();
  // }, this.interval);

  // console.log(`current index incremented ${++this.currentIndex}`);
},
getRunningSeconds(index) {
      if (this.isVideo(this.files[index])) {
        let videoPlayer = this.$refs.videoPlayer;
        return videoPlayer ? videoPlayer[this.currentIndex].duration : 0;
      }
      return 5; // Default for images
    },
storeDb () {
   const logs = JSON.parse(localStorage.getItem('ishtehar_db')) || [];

if (logs.length < 2) {
  const log = {
    primery_key: this.primaryKey++,
    ad_id: this.id[this.swiper.activeIndex],
    running_seconds: this.getRunningSeconds(this.swiper.activeIndex),
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
        .post('https://isteharandmore.com/api/ad_running_data', { logs }, { headers: { 'Content-Type': 'application/json' } })
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
