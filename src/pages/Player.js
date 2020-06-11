// @todo: import MediaPlayer from SDK
import {Lightning, Utils, MediaPlayer, Router} from "wpe-lightning-sdk";

export default class Player extends Lightning.Component {
    static _template() {
        const timingFunction = 'cubic-bezier(0.20, 1.00, 0.80, 1.00)';
        return {
          MediaPlayer: {
            type: MediaPlayer
          },
          Controls: {
            visible: false,
            y : 1000,
            /* flex: {},*/
            Playback: {
              x: 60,
              mountY: 0.3,
              src: Utils.asset("mediaplayer/pause.png"),
            },
            Duration: {
              x: 100,
              mountY: 0.3,
              text: {text: '0:00 / 0: 00', fontSize: 20, fontFace: "SourceSansPro-Regular"}
            },
            ProgressBar: {
              rect: true, mountY: 0, x: 200, w: 1600, h: 10, color: 0x80ffffff,
            },
            ProgressBar2: {
              rect: true, mountY: 0, x: 200, w: 0, h: 10, color: 0xffffffff,
              transitions: {
                  w: {duration: 1, timingFunction}
              }
            }
          },
          Spinner: {
            visible: true,
            src: Utils.asset("images/spinner.png"),
            mountX: .5, x: 960, y: 500, alpha: 0.001, color: 0xaaffffff,
            transitions: {
                alpha: {duration: 1, timingFunction}
            }
          }
            /**
             * @todo:
             * - Add MediaPlayer component (that you've imported via SDK)
             * - Add a rectangle overlay with gradient color to the bottom of the screen
             * - Add A Controls:{} Wrapper that hosts the following components:
             *   - PlayPause button image (see static/mediaplayer folder)
             *   - A skip button (see static/mediaplayer folder)
             *   - Progress bar (2 rectangles?)
             *   - add duration label
             *   - add text label for currentTime
             */
        };
    }

    _init() {
        /**
        * @todo:
        * tag MediaPlayer component and set correct consumer
        */
        this.tag('MediaPlayer').updateSettings({consumer: this});

        this.tag("Spinner").on("txLoaded", ()=> {
          this.tag("Spinner").setSmooth("alpha", 1);
        });

        this._spinnerAnimation = this.animation({duration: 1, repeat: -1, actions: [
          {t: 'Spinner', p: "rotation", sm: 0, v:{sm:0, 0:0, 1: Math.PI * 2} }
        ]});
    }

    _active() {
      this._spinnerAnimation.start()
    }

    _inactive() {
      this._spinnerAnimation.stop()
    }

    _firstActive() {
        this.tag('MediaPlayer').open(this._item.stream);
    }

    /**
     *@todo:
     * add focus and unfocus handlers
     * focus => show controls
     * unfocus => hide controls
     */
    _focus() {
      this.patch({
        Controls: { visible: true}
      })
    }

    _unfocus() {
      this.patch({
        Controls: { visible: false}
      })
    }

    set item(v){
        this._item = v;
    }

    _handleEscape(){
      Router.step(-1)
    }

    _handleSpace() {
      this.tag('MediaPlayer').playPause()
    }

    /**
     * @todo:
     * - add _handleEnter() method and make sure the video Pauses
     */
    _handleEnter(){
      this.tag('MediaPlayer').doPause()
    }

    _handleBack() {
      this.tag('MediaPlayer').seek(0, true)
    }
    /**
     * This will be automatically called when the mediaplayer pause event is triggerd
     * @todo:
     * - Add this Component in a Paused state
     */
    $mediaplayerPause() {
      this._setState("Paused")
    }

    $mediaplayerPlay() {
      this.tag("Spinner").setSmooth("alpha", 0);
      if (this._spinnerAnimation.isPlaying()) {
        this._spinnerAnimation.stop()
      }
      this._setState("");
    }

    $mediaplayerProgress({ currentTime, duration }) {
      // update label
      const current = Math.floor(currentTime)
      const minTime = Math.floor(current / 60);
      let secTime = String(current % 60);
      if (secTime.length == 1)
        secTime = "0" + secTime // padding
      const minDuration = Math.floor(duration  / 60);
      let secDuration = String(duration % 60);
      if (secDuration.length == 1)
        secDuration = "0" + secTime // padding
      const progress = `${minTime}:${secTime} / ${minDuration}: ${secDuration}`
      // update progress bar
      const progressRatio = current / duration
      const progressBarWidth = Math.floor(1600 * progressRatio)

      this.patch({
        Controls: {
          Duration: {text: {text: progress}},
          ProgressBar2: {w: progressBarWidth }
        }
      })

      // this.tag("Controls").tag("ProgressBar2").setSmooth("w", progressBarWidth);
    }

    get playButton() {
      return this.tag("Controls").tag("Playback");
    }

    static _states(){
        return [
            /**
             * @todo:
             * - Add paused state
             * - on enter change the play to pause button (see static/mediaplayer folder)
             * - on _handleEnter() play the asset again
             * - reset state on play
             */
            class Paused extends this {
                $enter(){
                    this.playButton.src = Utils.asset("mediaplayer/play.png");
                }
                _handleEnter(){
                    this.tag("MediaPlayer").doPlay();
                    this._setState("");
                }
                $exit() {
                  this.playButton.src = Utils.asset("mediaplayer/pause.png");
                }
            }
        ]
    }
}
