import {Component, PropsWithChildren} from 'react'
// 引入 Taro UI 组件库
// 源：https://taro-ui.jd.com/#/docs/introduction
import 'taro-ui/dist/style/index.scss'
import './app.scss'
import './eventBus';
import {EventBus} from "./eventBus";

class App extends Component<PropsWithChildren> {

  componentDidMount() {
    EventBus.on('userUpdate', (userInfo: any) => {
      this.setState({userInfo});
    });
  }

  render() {
    return this.props.children
  }
}

export default App
