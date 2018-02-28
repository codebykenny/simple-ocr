<template>
  <div id="wrapper">
    <div class="top">
      <div class="page-title">
        Simple OCR 1.0.2
      </div>
      <div class="drag-area">
        <div class="input-wrapper">
          <input id="file" @change="dropped" type="file" />
          <label for="file"><strong>Choose a file</strong><span class="box__dragndrop"> or drag it here</span>.</label>
        </div>
      </div>

      <p v-if="status.length > 0" class="text-center" style="font-size: 12px; padding: 0; margin: 0;">
        <strong>{{status}}</strong>
        <span>{{progress}} %</span>
      </p>
    </div>

    <div class="result" v-html="ocrdText"></div>

    <div v-if="ocrdText.length > 0" class="bottom">
      <button @click="reset()">Reset</button>
    </div>
  </div>
</template>

<script>
  import Tesseract from 'tesseract.js'
  const path = require("path")
  const { dialog } = require('electron').remote
  const remote = require('electron').remote

  export default {
    name: 'landing-page',
    components: { },
    data () {
      return {
        ocrdText: '',
        status: '',
        progress: 0
      }
    },
    methods: {
      reset () {
        this.ocrdText = '';
        this.status = '';
        this.progress = 0;
        this.setWindowSize(true)
      },
      dropped (e) {
        let _this = this;
        let file = e.target.files[0].path;

        console.log('processing...')

        this.reset()
        this.status = 'Starting...'

        Tesseract.create({
            workerPath: path.join(__static, '/tesseract/src/node/worker.js'),
            langPath: path.join(__static, '/tesseract/langs'),
            corePath: path.join(__static, '/tesseract/src/index.js')
          }).recognize(file, {lang: "eng"})
          .progress(function  (p) {
            _this.status = p.status

            if (p.progress) {
              _this.progress = (p.progress * 100).toFixed(2)
            }
          })
          .then(function(result){
            _this.ocrdText = result.text
            _this.setWindowSize()
          })
          .catch(e => {
            console.log(e)
          })
      },
      setWindowSize (small) {
        setTimeout(function () {
          var window = remote.getCurrentWindow()
          window.setContentSize(small ? 470 : 600, document.getElementsByTagName('html')[0].offsetHeight)
        }, 100)
      }
    },
    created () {
      this.setWindowSize(true)

      // Uncomment to Force developers tools on production
      // var window = remote.getCurrentWindow()
      // window.openDevTools()
    }
  }
</script>

<style>
  #wrapper {
    font-family: 'Montserrat', sans-serif;
    position: relative;
  }

  .text-center {
    text-align: center;
  }

  .top {
    background: white;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    border-bottom: 1px solid whitesmoke;
    padding-top: 20px;
    padding-bottom: 10px;

    -webkit-app-region: drag;
  }

  .drag-area {
    text-align: center;
    position: relative;
    display: block;
    padding: 24px 20px;
    justify-content: center;
    align-content: center;
    border: 2px dashed #989898;
    /* border-radius: 20px; */
    margin: 20px;
  }

  .drag-area.ran {
    padding: 24px 20px;
  }

  .drag-area input {
    width: 100%;
    height: 100%;
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
  }

  .result {
    max-width: 100%;
    white-space: pre-line;
    padding: 160px 20px 20px 20px;
    font-size: 12px;
  }

  .bottom {
    text-align: center;
    /* position: absolute; */
    width: 100%;
    bottom: 0;
    left: 0;
  }

  html, .body {
    background: #1b2429;
  }

  .top {
    background: #1b2429;
    border-bottom: 1px solid #2a323a;
    color: white;
  }

  .result {
    color: white;
  }

  .page-title {
    color: white;
    font-size: 12px;
    position: absolute;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    top: 8px;
    font-weight: 500;
    width: 85px;
    letter-spacing: 0.6px;
  }

  button {
    cursor: pointer;
    border: 1px solid white;
    background: none;
    color: white;
    padding: 5px 10px;
    font-size: 13px;
    border-radius: 5px;
    transition: all 0.25s ease;
  }

  button:hover {
    background: #28343c;
  }
</style>
