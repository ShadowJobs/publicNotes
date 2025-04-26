
import { connect } from "react-redux"
const ReduxPage2 = (props) => {
  return <div className="with-border">

    <div>两个独立的provider，只要store传一样的值，就能数据通信，此处跟左侧的counter数据是一个</div>
    store count={props.count}
  </div>
}
const stateToProps = state => {
  return { count: state.count, }
}
const dispatchToProps = () => { }
export default connect(stateToProps, dispatchToProps)(ReduxPage2)