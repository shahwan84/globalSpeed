import { useEffect, useState } from "react"
import { Tooltip } from "../comps/Tooltip"
import { LOCALE_MAP } from "../utils/gsm"
import { SetView, useStateView } from "../hooks/useStateView"
import { getDefaultSpeedSlider } from "src/defaults/constants"
import { MAX_SPEED_CHROMIUM, MIN_SPEED_CHROMIUM } from "../defaults/constants"

import { IndicatorModal } from "./IndicatorModal"
import { SpeedPresetModal } from "./SpeedPresetModal"
import { SliderMicro } from "src/comps/SliderMicro"
import { clamp, isFirefox, isMobile } from "src/utils/helper"
import { Gear } from "src/comps/svgs"
import { Toggle } from "src/comps/Toggle"
import { CONTEXT_KEYS, Context, InitialContext, StateView } from "src/types"
import { fetchView } from "src/utils/state"
import { getDefaultURLCondition } from "src/defaults"
import { URLModal } from "./URLModal"
import { produce } from "immer"
import { Minmax } from "src/comps/Minmax"
import { GoX } from "react-icons/go"
import { WidgetModal } from "./WidgetModal"
import "./SectionFlags.css"

export function SectionFlags(props: {}) {
  const [showIndicatorModal, setShowIndicatorModal] = useState(false)
  const [showGhostModal, setShowGhostModal] = useState(false)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [showWidgetModal, setShowWidgetModal] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [ has, setHas ] = useState(false)

  useEffect(() => {
      chrome.permissions.contains({origins: ["https://*/*", "http://*/*"]}).then(v => {
          setHas(v)
      })
  }, [])

  const [view, setView] = useStateView({language: true, darkTheme: true, fontSize: true, hideBadge: true, pinByDefault: true, initialContext: true, ghostMode: true, ghostModeUrlCondition: true, hideMediaView: true, freePitch: true, speedSlider: true, virtualInput: true, circleWidget: true, circleWidgetIcon: true})
  const [ viewAlt ] = useStateView({indicatorInit: true, hideIndicator: true})
  if (!view || !viewAlt) return <div></div>

  const defaultSlider = getDefaultSpeedSlider()

  return (
    <div className="section SectionFlags">
      {showIndicatorModal && (
        <IndicatorModal view={viewAlt} setView={setView} onClose={() => setShowIndicatorModal(null)}/>
      )}
      {showGhostModal && (
        <URLModal
          value={view.ghostModeUrlCondition || getDefaultURLCondition(true)} 
          onClose={() => setShowGhostModal(false)} 
          onReset={() => setView({ghostModeUrlCondition: null})}
          onChange={v => {
            setView({ghostModeUrlCondition: v.parts.length ? v : null})
          }}
        />
      )}
      {showPresetModal && (
        <SpeedPresetModal onClose={() => setShowPresetModal(null)}/>
      )}
      {showWidgetModal && (
        <WidgetModal onClose={() => setShowWidgetModal(null)}/>
      )}
      <h2>{gvar.gsm.options.flags.header}</h2>
      <div className="fields">

        {/* Language */}
        <div className="field">
          <div className="labelWithTooltip">
            <span>{gvar.gsm.options.flags.language}</span>
            <Tooltip tooltip={gvar.gsm.options.flags.languageTooltip}/>
          </div>
          <select className="padded" value={view.language || "detect"} onChange={e => {
            setView({language: e.target.value})
            setTimeout(() => {
              window.location.reload()
            }, 100) 
          }}>
            {Object.keys(LOCALE_MAP).map(key => (
              <option key={key} value={key} title={LOCALE_MAP[key].title}>{LOCALE_MAP[key].display}</option>
            ))}
          </select>
        </div>

        {/* Dark theme */}
        <div className="field">
          <span>{gvar.gsm.options.flags.darkTheme}</span>
          <Toggle value={!!view.darkTheme} onChange={e => {
            setView({darkTheme: !view.darkTheme})
          }}/>
        </div>     

        {/* Permission */}
        {(isFirefox() || !has) && (
          <div className="field">
            <div className="labelWithTooltip">
              <span>{gvar.gsm.options.flags.grantPermission}</span>
              <Tooltip tooltip={gvar.gsm.options.flags.grantPermissionTooltip}/>
            </div>
            <Toggle value={has} onChange={e => {
              chrome.permissions[has ? "remove" : "request"]({origins: ["https://*/*", "http://*/*"]}).then(v => {
                  setHas(has ? !v : v)
              })
            }}/>
          </div> 
        )}


        {/* Show badge */}
        <div className="field marginTop">
          <div className="labelWithTooltip">
            <span>{gvar.gsm.options.flags.showBadge}</span>
            <Tooltip tooltip={gvar.gsm.options.flags.showBadgeTooltip}/>
          </div>
          <Toggle value={!view.hideBadge} onChange={e => {
            setView({hideBadge: !view.hideBadge})
          }}/>
        </div>

        {/* Show indicator */}
        <div className="field indentFloat">
          <div className="labelWithTooltip">
            <span>{gvar.gsm.options.flags.showIndicator}</span>
            <Tooltip tooltip={gvar.gsm.options.flags.showIndicatorTooltip}/>
          </div>
          <div className="fieldValue">
            <Toggle value={!viewAlt.hideIndicator} onChange={async e => {
              setView({
                hideIndicator: !viewAlt.hideIndicator,
                keybinds: produce((await fetchView({keybinds: true})).keybinds || [], d => {
                  d.forEach(d => {
                    delete d.invertIndicator
                  })
                })
              })
            }}/>
            <div className="float">
              {viewAlt.hideIndicator ? null : <>
                <button className="icon gear interactive" onClick={e => setShowIndicatorModal(true)}>
                   <Gear size="1.57rem"/>
                </button>
              </>}
            </div> 
          </div>
        </div>

        {/* Show media view */}
        <div className="field">
          <span>{gvar.gsm.options.flags.showMediaView}</span>
          <Toggle value={!view.hideMediaView} onChange={e => {
            setView({hideMediaView: !view.hideMediaView})
          }}/>
        </div>

        {/* Circle widget */}
        <CircleWidget setView={setView} active={view.circleWidget} setShowWidgetModal={setShowWidgetModal} showOption={view.circleWidget || view.circleWidgetIcon}/>

        {/* Pin by default */}
        <div className="field marginTop">
          <div className="labelWithTooltip">
            <span>{gvar.gsm.options.flags.pinByDefault}</span>
            <Tooltip tooltip={gvar.gsm.options.flags.pinByDefaultTooltip}/>
          </div>
          <Toggle value={!!view.pinByDefault} onChange={e => {
            setView({pinByDefault: !view.pinByDefault})
          }}/>
        </div>

        {/* Initial state */}
        {!!view.pinByDefault && (
          <div className="field indent">
            <span>{gvar.gsm.options.flags.initialState}</span>
            <select className="padded" value={view.initialContext ?? InitialContext.PREVIOUS} onChange={async e => {
              
              const partial = {initialContext: parseInt(e.target.value)} as Partial<StateView>
              if (partial.initialContext === InitialContext.CUSTOM) {
                partial.customContext = (await fetchView(CONTEXT_KEYS, gvar.tabInfo.tabId)) as Context
              }
              setView(partial)
              partial.customContext && alert(gvar.gsm.options.flags.customContextTooltip)
            }}>
              <option value={InitialContext.PREVIOUS}>{gvar.gsm.options.flags.previousContext}</option>
              <option value={InitialContext.GLOBAL}>{gvar.gsm.options.flags.globalContext}</option>
              <option value={InitialContext.NEW}>{gvar.gsm.options.flags.newContext}</option>
              <option value={InitialContext.CUSTOM}>{gvar.gsm.options.flags.customContext}</option>
            </select>
          </div>
        )}

        {/* Ghost mode */}
        <div className="field indentFloat">
          <div className="labelWithTooltip">
            <span>{gvar.gsm.options.flags.ghostMode}</span>
            <Tooltip tooltip={gvar.gsm.options.flags.ghostModeTooltip}/>
          </div>
          <div className="fieldValue">
            <Toggle value={!!view.ghostMode} onChange={e => {
              setView({ghostMode: !view.ghostMode})
            }}/>
            <div className="float">
              {!view.ghostMode ? null : <>
                <button className="icon gear interactive" onClick={e => setShowGhostModal(true)}>
                   <Gear size="1.57rem"/>
                </button>
              </>}
            </div> 
          </div>
        </div>

        {/* Speed changes pitch */}
                <div className="field marginTop">
          <span>{gvar.gsm.command.speedChangesPitch}</span>
          <Toggle value={!!view.freePitch} onChange={e => {
            setView({freePitch: !view.freePitch})
          }}/>
        </div>

        {/* Speed slider  */}
        <div className="field speedSlider">
          <span>{gvar.gsm.options.flags.speedSlider}</span>
            {view.speedSlider ? (
              <div className="control">
                <Minmax realMin={MIN_SPEED_CHROMIUM} realMax={MAX_SPEED_CHROMIUM} min={view.speedSlider?.min ?? defaultSlider.min} max={view.speedSlider?.max ?? defaultSlider.max} onChange={(min: number, max: number) => {
                  setView({
                    speedSlider: {min, max}
                  })
                }} defaultMin={defaultSlider.min} defaultMax={defaultSlider.max}/>
                <button className="icon" onClick={() => {
                    setView({speedSlider: null})
                  }}>
                  <GoX size="1.6rem"/>
                </button>
              </div>
            ) : (
              <Toggle value={!!view.speedSlider} onChange={v => setView({speedSlider: view.speedSlider ? null : getDefaultSpeedSlider()})}/>
            )}
        </div>

        {!showMore ? <button className="showMore" onClick={() => setShowMore(true)}>...</button> : <>
          {/* Font size */}
          <div className="field marginDoubleTop">
            <span>{gvar.gsm.options.flags.textSize}</span>
            <SliderMicro 
              value={view.fontSize ?? 1.0} 
              onChange={v => {
                setView({fontSize: clamp(0.9, 1.1, v)})
                // setView({fontSize: clamp(0.5, 3, v)})
              }}
              default={1.0}
              sliderMin={0.9}
              sliderMax={1.1}
              sliderStep={0.01}
            />
          </div>  

           {/* Keyboard input */}
          <div className="field">
            <div className="labelWithTooltip">
              <span>{gvar.gsm.options.flags.keyboardInput}</span>
              <Tooltip tooltip={gvar.gsm.options.flags.keyboardInputTooltip}/>
            </div>
            <select className="padded" value={view.virtualInput ? "v" : "q"} onChange={async e => {
              setView({virtualInput: e.target.value === "v"})
            }}>
              <option value="q">{gvar.gsm.options.flags.qwerty}</option>
              <option value="v">{gvar.gsm.options.flags.virtual}</option>
            </select>
          </div>

          {/* Speed presets */}
          <div className="field">
            <span>{gvar.gsm.options.flags.speedPresets}</span>
            <button className="icon gear interactive" onClick={e => setShowPresetModal(true)}>
                  <Gear size="1.57rem"/>
            </button>
          </div>
        </>}
      </div>

    </div>
  )
}

function CircleWidget(props: {
  active?: boolean,
  showOption?: boolean
  setView: SetView,
  setShowWidgetModal: (v: boolean) => void 
}) {
  return (
    <div className="field indentFloat">
      <div className="labelWithTooltip">
        <span>{gvar.gsm.options.flags.widget.option}</span>
        <Tooltip tooltip={gvar.gsm.options.flags.widget.optionTooltip.concat(isMobile() ? gvar.gsm.options.flags.widget.movementMobile : gvar.gsm.options.flags.widget.movementDesktop)}/>
      </div>
      <div className="fieldValue">
        <Toggle value={!!props.active} onChange={e => {
          props.setView({circleWidget: !props.active})
        }}/>
        <div className="float">
          {!!props.showOption && (
            <button className="icon gear interactive" onClick={e => props.setShowWidgetModal(true)}>
              <Gear size="1.57rem"/>
            </button>
          )}
        </div> 
      </div>
    </div>
  )
}