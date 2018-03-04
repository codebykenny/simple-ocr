<template>
  <div id="wrapper">

    <div class="top">
      <div class="top-right">
        <button v-if="ocrdText.length > 0" @click="reset()"><i class="fas fa-redo"></i></button>
        <button @click="toggleSettings()"><i class="fas fa-cog"></i></button>
      </div>
      <div class="page-title">
        Simple OCR
      </div>


      <settings-dropdown :mode="mode" :changeMode="changeMode" v-if="showSettings == true"></settings-dropdown>

      <div class="drag-area" :class="{'running': running}">
        <div v-if="running == false" class="input-wrapper">
          <input id="file" @change="dropped" type="file" />
          <label for="file"><strong>Choose a file</strong><span class="box__dragndrop"> or drag it here</span>.</label>
        </div>

        <div v-show="running == true" id="progress"></div>
      </div>

      <p v-if="status.length > 0" class="footer text-center" style="font-size: 12px; padding: 0; margin: 0;">
        {{status}}
      </p>
    </div>

    <div class="result">
      <div class="normal" v-if="mode == 'normal'" v-html="ocrdText"></div>
      <div class="paragraph" v-if="mode == 'paragraph'">
        <p v-for="p in paragraphs">{{p.text}}</p>
      </div>
      <div class="block" v-if="mode == 'block'" v-html="ocrdText"></div>
    </div>
  </div>
</template>

<script>
  import SettingsDropdown from './LandingPage/SettingsDropdown.vue'
  import Tesseract from 'tesseract.js'
  import db from '../database'

  const ProgressBar = require('progressbar.js')
  const path = require("path")
  const { dialog } = require('electron').remote
  const remote = require('electron').remote
  const ipcRenderer = require('electron').ipcRenderer

  export default {
    name: 'landing-page',
    components: { },
    data () {
      return {
        running: false,
        ocrdText: '',
        status: 'Waiting for file..',
        progress: 0,
        progressBar: {},
        paragraphs: [],
        mode: 'normal',
        showSettings: false
      }
    },
    methods: {
      reset () {
        this.ocrdText = ''
        this.paragraphs = []
        this.status = ''
        this.progress = 0
        this.setWindowSize(true)
      },
      dropped (e) {
        let _this = this
        let file = e.target.files[0].path

        console.log('processing...', e.target.files[0])

        if (e.target.files[0].type.indexOf('image') == -1) {
          dialog.showMessageBox({
            type: 'error',
            title: 'Whoops..',
            message: 'Whoops..',
            detail: 'Can only handle image files at this time..',
            buttons: ['OK']})

          return
        }

        this.reset()
        this.status = 'Starting...'
        this.running = true
        this.startProgressBar()

        Tesseract.create({
            workerPath: path.join(__static, '/tesseract/src/node/worker.js'),
            langPath: path.join(__static, '/tesseract/langs'),
            corePath: path.join(__static, '/tesseract/src/index.js')
          }).recognize(file, {lang: "eng"})
          .progress(function  (p) {
            _this.status = p.status

            if (p.progress) {
              _this.progress = (p.progress * 100).toFixed(2)

              if (p.status == 'recognizing text') {
                _this.progressBar.animate(p.progress)
              }
            }
          })
          .then(function(result){
            _this.ocrdText = result.text
            _this.paragraphs = result.paragraphs
            _this.setWindowSize()
            _this.running = false
            _this.progressBar.destroy()
            _this.status = 'Done'
          })
          .catch(e => {
            console.log(e)
            _this.running = false
          })
      },
      toggleSettings () {
        this.showSettings = !this.showSettings
      },
      changeMode (mode) {
        this.mode = mode
        db.settings.put({
          'key': 'mode',
          'value': mode
        })
      },
      startProgressBar () {
          let _this = this

          this.progressBar = new ProgressBar.Circle('#progress', {
            color: '#60c0f5',
            strokeWidth: 3,
            trailWidth: 2,
            easing: 'easeInOut',
            trailColor: '#797979',
            duration: 700,
            text: {
              autoStyleContainer: false
            },
            from: { color: '#60c0f5', width: 3 },
            to: { color: '#60c0f5', width: 3 },
            step: function(state, circle) {
              circle.path.setAttribute('stroke', state.color)
              circle.path.setAttribute('stroke-width', state.width)

              var value = Math.round(circle.value() * 100)
              if (value === 0) {
                circle.setText('')
              } else {
                circle.setText(value)
              }

              }
          })

          this.progressBar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif'
          this.progressBar.text.style.fontSize = '2rem'

          setTimeout(() => {
            this.setWindowSize(true)
          }, 500)
      },
      setWindowSize (small) {
        setTimeout(function () {
          var window = remote.getCurrentWindow()

          ipcRenderer.send('resizeWindow', [small ? 470 : 600, document.getElementsByTagName('html')[0].offsetHeight])
        }, 100)
      }
    },
    created () {
      this.setWindowSize(true)

      // Uncomment to Force developers tools on production
      // var window = remote.getCurrentWindow()
      // window.openDevTools()

      db.settings.get({'key': 'mode'}, mode => {
        if (mode) {
          this.mode = mode.value
        }
      })
    },
    components: { SettingsDropdown }
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
    left: 0;
    padding-top: 20px;
    position: fixed;
    top: 0;
    width: 100%;

    -webkit-app-region: drag;
  }

  .top-right {
    position: absolute;
    top: 5px;
    right: 4px;
    z-index: 2;
  }

  .top-right button {
    font-size: 14px;
    cursor: pointer;
    border: 0px;
    background: clear;
    padding: 0px 2px;
    transition: all 0.25s ease;
  }

  .top-right button:focus {
    outline: none;
  }

  .top-right button:hover {
    color: #e4e4e4;
  }

  .drag-area {
    align-content: center;
    border-radius: 8px;
    border: 2px dashed rgba(255, 255, 255, 0.43);
    display: block;
    justify-content: center;
    margin: 20px 20px 10px;
    padding: 66px 20px;
    position: relative;
    text-align: center;
    transition: all 0.25s ease;
  }

  .drag-area:hover {
    border-color: #60c0f5;
    color: #60c0f5;
    margin: 20px 18px 10px;
    padding: 68px 20px;
  }

  .drag-area.running {
    padding: 26px 20px;
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
    padding: 200px 20px 20px 20px;
    font-size: 12px;
  }

  .result .normal {
    white-space: pre-line;
  }

  .result .block {
    padding: 5px;
  }

  .bottom {
    text-align: center;
    width: 100%;
    bottom: 0;
    left: 0;
  }

  html, .body {
    background: #1b2429;
  }

  .top {
    background: #1b2429;
    color: white;
  }

  .result {
    color: white;
  }

  .page-title {
    color: white;
    font-size: 12px;
    font-weight: 500;
    left: 0;
    letter-spacing: 0.6px;
    margin-left: auto;
    margin-right: auto;
    position: absolute;
    right: 0;
    top: 8px;
    width: 85px;
  }

  button {
    background: none;
    border-radius: 5px;
    border: 1px solid white;
    color: white;
    cursor: pointer;
    font-size: 13px;
    padding: 5px 10px;
    transition: all 0.25s ease;
  }

  button:hover {
    background: #28343c;
  }

  #progress {
    height: 100px;
    margin: 0 auto;
    text-align: center;
    width: 100px;
  }

  .footer {
    background: #1b2429;
    bottom:6px;
    font-size: 11px;
    font-weight: bold;
    left: 0px;
    letter-spacing: 1px;
    position: fixed;
    right: 0px;
    text-transform: capitalize;
  }
</style>
