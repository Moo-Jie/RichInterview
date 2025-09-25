import {Component} from 'react';
import {Canvas, Image, ScrollView, Text, View} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {AtButton, AtIcon, AtModal, AtModalContent, AtTag} from 'taro-ui';
import {getQuestionDetail, getQuestionHotspotDetail, incrementStarCount, incrementViewCount} from '../../api/question';
import TagParser from '../../components/TagParserComponent';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import dayjs from 'dayjs';
import {addUserSignIn, getUserSignInRecord, UserVO} from '../../api/user';
import './index.scss';

type QuestionDetail = {
  answer: string;
  content: string;
  createTime: string;
  updateTime: string;
  id: string;
  questionBankId: string;
  reviewMessage: string;
  reviewStatus: number;
  reviewTime: string;
  reviewerId: string;
  source: string;
  tagList: string[];
  tags: string;
  title: string;
  userId: string;
  user: UserVO;
  answerSupplement?: string;
};

type QuestionHotspotDetail = {
  answer?: string;
  collectNum?: number;
  commentNum?: number;
  content?: string;
  createTime?: string;
  forwardNum?: number;
  id?: number;
  questionId?: number;
  starNum?: number;
  tagList: string[];
  title?: string;
  updateTime?: string;
  viewNum?: number;
};

type State = {
  loading: boolean;
  error: boolean;
  starred: boolean;
  question: QuestionDetail | null;
  questionHotspotDetail: QuestionHotspotDetail | null;
  showShareCard: boolean;
  shareCardPath: string;
  todaySigned: boolean;
  signInRecords: number[];
  currentYear: number;
  todayIndex: number;
};

export default class QuestionDetailPage extends Component<{}, State> {
  state: State = {
    loading: true,
    error: false,
    starred: false,
    question: null,
    questionHotspotDetail: null,
    showShareCard: false,
    shareCardPath: '',
    todaySigned: false,
    signInRecords: [],
    currentYear: new Date().getFullYear(),
    todayIndex: this.getDayOfYear(new Date()),
  };

  componentDidMount() {
    const {id} = Taro.getCurrentInstance().router?.params || {};
    if (id) {
      this.loadData(id);
      // 增加浏览量
      incrementViewCount(id).catch(console.error);
    } else {
      console.log(" id 不存在");
      setTimeout(() => Taro.navigateBack(), 0);
    }
    this.loadSignInData();
  }

  // 用户中心的日期计算方法
  getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // 用户中心的签到逻辑
  handleSignIn = async () => {
    try {
      const result = await addUserSignIn();
      if (result) {
        Taro.showToast({
          title: '签到成功！',
          icon: 'success',
          success: () => {
            setTimeout(() => {
              const pages = Taro.getCurrentPages();
              if (pages.length > 0) {
                const currentPage = pages[pages.length - 1];
                const url = `/${currentPage.route}?refresh=${Date.now()}`;
                Taro.redirectTo({url});
              }
            }, 300);
          }
        });
        await this.loadSignInData();
      }
    } catch (error) {
      Taro.showToast({title: '签到失败，请重试', icon: 'none'});
    }
  };

  // 加载签到数据
  loadSignInData = async () => {
    try {
      const records = await getUserSignInRecord(this.state.currentYear);
      this.setState({
        signInRecords: records,
        todaySigned: records.includes(this.state.todayIndex)
      });
    } catch (error) {
      console.error('加载签到记录失败:', error);
    }
  };

  async loadData(questionId: string) {
    try {
      const question = await getQuestionDetail(questionId);
      const questionHotspotDetail = await getQuestionHotspotDetail(questionId);

      if (!question || question.isDelete) {
        throw new Error('题目不存在');
      }
      if (!questionHotspotDetail || questionHotspotDetail.isDelete) {
        throw new Error('题目热点不存在');
      }

      this.setState({
        question: {
          ...question,
          id: String(question.id),
          createTime: dayjs(question.createTime).format('YYYY-MM-DD'),
          updateTime: dayjs(question.updateTime).format('YYYY-MM-DD')
        },
        loading: false,
        starred: question.starNum > 0,
        questionHotspotDetail: {
          ...questionHotspotDetail
        }
      });
    } catch (error) {
      this.setState({error: true, loading: false});
      setTimeout(() => Taro.navigateBack(), 3000);
    }
  }

  handleStar = async () => {
    const {question} = this.state;
    // 添加状态检查
    if (this.state.starred || !question?.id) return;

    try {
      const success = await incrementStarCount(question.id);
      if (success) {
        this.setState(prevState => ({
          starred: true,
          questionHotspotDetail: {
            ...prevState.questionHotspotDetail,
            starNum: (prevState.questionHotspotDetail?.starNum || 0) + 1,
            tagList: prevState.questionHotspotDetail?.tagList || []
          }
        }));
        Taro.showToast({title: '点赞成功', icon: 'success'});
      }
    } catch (error) {
      Taro.showToast({title: '点赞失败，请重试', icon: 'none'});
    }
  };

  drawRoundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
    ctx.arc(x + w - r, y + h - r, r, Math.PI * 2, Math.PI * 0.5);
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  // 计算文本所需高度
  calculateTextHeight(ctx: any, text: string, maxWidth: number, lineHeight: number) {
    const chars = text.split('');
    let line = '';
    let lines = 1; // 起始行数

    for (const char of chars) {
      const testLine = line + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line.length > 0) {
        lines++;
        line = char; // 开始新行
      } else {
        line = testLine;
      }
    }

    return lines * lineHeight;
  }

  private truncateTextByHeight(ctx: any, text: string, maxWidth: number, lineHeight: number, maxHeight: number) {
    const maxLines = Math.floor(maxHeight / lineHeight);
    let currentLine = '';
    let lines = 0;
    let result = '';

    for (const char of text) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth) {
        lines++;
        if (lines >= maxLines) {
          return result + '...';
        }
        result += currentLine + '\n';
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    return result;
  }

  // 生成分享卡片
  handleShare = async () => {
    const {question, questionHotspotDetail} = this.state;

    if (!question || !questionHotspotDetail) {
      Taro.showToast({title: '题目尚未加载完成', icon: 'none'});
      return;
    }

    try {
      // 获取设备信息计算合适的画布尺寸
      const systemInfo = await Taro.getSystemInfo();
      const pixelRatio = systemInfo.pixelRatio || 2;
      const canvasWidth = 750;

      // 创建离屏Canvas
      await new Promise(resolve => Taro.nextTick(resolve));
      const ctx = Taro.createCanvasContext('shareCanvas');

      // 设置测量文本
      ctx.setFontSize(28);

      // 计算内容高度
      const maxContentWidth = canvasWidth - 120;
      const lineHeight = 40;

      // 内容截断
      let contentToShow = question.answer
        .replace(/(\d+\.)|-/g, '\n$&')  // 在序号前强制换行
        .replace(/\n+/g, '\n')         // 合并多个换行
        .trim();

      let needTruncate = contentToShow.length > 1000;
      if (needTruncate) {
        contentToShow = contentToShow.substring(0, 1000) + '...';
      }

      let contentHeight = this.calculateTextHeight(ctx, contentToShow, maxContentWidth, lineHeight);

      // 添加提示信息高度
      if (needTruncate) {
        const tipHeight = this.calculateTextHeight(ctx, '字数过多，请前往小程序或官网进行学习', maxContentWidth, lineHeight);
        contentHeight += tipHeight + 20; // 增加提示信息和间距
      }

      // 内容区域背景高度 = 文本高度 + 上下内边距
      const contentBgHeight = contentHeight + 100;

      // 计算卡片总高度
      const minCanvasHeight = 1100;
      const canvasHeight = Math.max(
        minCanvasHeight,
        // 基础布局高度 + 内容区域高度
        380 + contentBgHeight + 180
      );

      const maxContentHeight = canvasHeight - 500;

      if (contentHeight > maxContentHeight) {
        needTruncate = true;
        contentHeight = maxContentHeight;
        contentToShow = this.truncateTextByHeight(ctx, contentToShow, maxContentWidth, lineHeight, maxContentHeight);
      }

      // 2. 开始绘制

      // 绘制卡片背景
      ctx.setFillStyle('#ffffff');
      this.drawRoundRect(ctx, 20, 20, canvasWidth - 40, canvasHeight - 40, 20);

      // 标题栏
      const headerHeight = 140;
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
      gradient.addColorStop(0, '#4A6EFF');
      gradient.addColorStop(1, '#8B5CF6');
      ctx.setFillStyle(gradient);
      ctx.fillRect(0, 0, canvasWidth, headerHeight);

      // 标题文字
      ctx.setFontSize(44);
      ctx.setFillStyle('#ffffff');
      ctx.setTextAlign('center');
      ctx.fillText('题目分享卡', canvasWidth / 2, headerHeight - 20);

      // 用户信息
      ctx.setFontSize(28);
      ctx.setFillStyle('rgba(255,255,255,0.8)');
      ctx.setTextAlign('left');
      ctx.fillText(`   分享者：${question.user?.userName || 'RICH 面试刷题平台用户'}` + '              分享自: RICH 面试刷题平台', 40, headerHeight - 90);

      // 题目标题
      let currentY = 220;
      ctx.setFontSize(36);
      ctx.setFillStyle('#333333');
      currentY = this.drawWrappedText(ctx, question.title, 40, currentY, canvasWidth - 80, 40);

      // 热度信息
      const statsY = currentY + 14;
      ctx.setFontSize(28);
      ctx.setFillStyle('#666666');
      ctx.fillText('🔥', 60, statsY);
      ctx.fillText(`${questionHotspotDetail.viewNum || 0} 浏览`, 100, statsY);
      ctx.fillText('❤️', 260, statsY);
      ctx.fillText(`${questionHotspotDetail.starNum || 0} 收藏`, 300, statsY);

      // 标签区域
      let tagX = 40;
      const tagY = currentY + 30; // 标题后留出间距
      question.tagList.slice(0, Math.min(4, question.tagList.length)).forEach(tag => {
        ctx.setFillStyle('#4A6EFF');
        const tagWidth = ctx.measureText(tag).width + 40;
        this.drawRoundRect(ctx, tagX, tagY, tagWidth, 50, 25);
        ctx.setFillStyle('#ffffff');
        ctx.fillText(tag, tagX + 20, tagY + 34);
        tagX += tagWidth + 20;
      });

      // 内容区域
      const contentBoxY = tagY + 80; // 标签下方留出空间
      ctx.setFillStyle('#f8fafc');
      this.drawRoundRect(ctx, 40, contentBoxY, canvasWidth - 80, contentBgHeight, 20);

      // 题目答案内容
      ctx.setFillStyle('#222222');
      ctx.setFontSize(28);

      let lastY = this.drawWrappedText(ctx, contentToShow, 60, contentBoxY + 50, canvasWidth - 120, 40);

      if (needTruncate) {
        lastY = this.drawWrappedText(ctx, '字数过多，请前往小程序或官网进行学习', 60, lastY + 20, canvasWidth - 120, 36);
      }
      this.drawWrappedText(ctx, contentToShow, 60, contentBoxY + 50, canvasWidth - 120, 40);

      // 绘制内容
      ctx.draw(false, async () => {
        // 生成图片
        const res = await Taro.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          destWidth: canvasWidth * pixelRatio,
          destHeight: canvasHeight * pixelRatio,
          fileType: 'jpg',
          quality: 0.9
        });

        this.setState({
          shareCardPath: res.tempFilePath,
          showShareCard: true
        });

        Taro.hideLoading();
      });

    } catch (e) {
      Taro.showToast({
        title: '图片生成失败:' + e.message,
        icon: 'none'
      });
      console.error('生成分享卡片错误:', e);
    }
  };

  // 绘制文本自动换行（返回绘制后的y坐标）
  drawWrappedText(ctx: Taro.CanvasContext, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    let yPos = y;
    // 处理原始文本中的换行符分割段落
    const paragraphs = text.split('\n');

    paragraphs.forEach((paragraph: any, pIndex: number) => {
      let currentLine = '';
      // 处理每个段落中的字符
      for (const char of paragraph) {
        const testLine = currentLine + char;
        const metrics = ctx.measureText(testLine);

        // 当宽度超过限制时换行
        if (metrics.width > maxWidth) {
          if (currentLine.length > 0) {
            ctx.fillText(currentLine, x, yPos);
            yPos += lineHeight;
          }
          currentLine = char; // 新行以当前字符开始
        } else {
          currentLine = testLine;
        }
      }

      // 绘制段落剩余内容
      if (currentLine) {
        ctx.fillText(currentLine, x, yPos);
        yPos += lineHeight;
      }

      // 在段落之间添加额外行间距（最后一段不加）
      if (pIndex < paragraphs.length - 1) {
        yPos += lineHeight;
      }
    });

    return yPos;
  }

  // 关闭分享弹窗
  handleCloseShareCard = () => {
    this.setState({showShareCard: false});
  };

  // 用户手动保存图片
  handleSaveImage = () => {
    const {shareCardPath} = this.state;

    if (!shareCardPath) {
      Taro.showToast({title: '图片保存失败', icon: 'none'});
      return;
    }

    Taro.saveImageToPhotosAlbum({
      filePath: shareCardPath,
      success: () => {
        Taro.showToast({title: '图片保存成功', icon: 'success'});
        this.setState({showShareCard: false});
      },
      fail: (err) => {
        console.error('保存图片失败:' + err.errMsg, err);
        Taro.showToast({title: '保存失败，请重试:' + err.errMsg, icon: 'none'});
      }
    });
  };

  handleGoBack = () => {
    Taro.navigateBack();
  };

  render() {
    const {question, questionHotspotDetail, loading, error, showShareCard, shareCardPath} = this.state;

    if (loading) {
      return (
        <View className='login-prompt-container'>
          <View className='login-prompt-card'>
            <Text className='prompt-icon'>📝</Text>
            <Text className='prompt-title'>题目加载中</Text>
            <Text className='prompt-desc'>请稍候，精彩内容马上呈现</Text>
          </View>
        </View>
      );
    }

    if (error || !question || !questionHotspotDetail) {
      return (
        <View className='login-prompt-container'>
          <View className='login-prompt-card'>
            <Text className='prompt-icon'>⚠️</Text>
            <Text className='prompt-title'>题目加载失败，请先登录</Text>
            <Text className='prompt-desc'>请稍后再试或返回重试</Text>
          </View>
        </View>
      );
    }

    return (
      <View>
        {/* 隐藏的Canvas用于生成图片 */}
        <Canvas
          canvasId='shareCanvas'
          id='shareCanvas'
          style={{
            width: '750px',
            height: '2000px',
            position: 'fixed',
            top: '-99999px',
            left: '-99999px'
          }}
        />

        {/* 分享卡片模态框 */}
        <AtModal
          isOpened={showShareCard}
          onClose={this.handleCloseShareCard}
        >
          <AtModalContent>
            <View className='share-card-modal'>
              <Text className='share-title'>长按保存分享卡片</Text>
              <Image
                src={shareCardPath}
                mode='widthFix'
                style={{width: '100%'}}
                showMenuByLongpress
              />
              <View
                className='save-button'
                onClick={this.handleSaveImage}
              >
                <AtIcon value='download' size='20' color='#fff'/>
                <Text className='button-text'>保存到相册</Text>
              </View>
            </View>
          </AtModalContent>
        </AtModal>

        <ScrollView className='question-detail-page' scrollY>
          {/* 顶部操作栏 */}
          <View className='action-bar'>
            <View className='action-btn' onClick={this.handleGoBack}>
              <AtIcon value='chevron-left' size='18' color='#fff'/>
            </View>
            <View className='action-btn' onClick={this.handleStar}>
              <AtIcon
                value='star'
                size='18'
                color={this.state.starred ? '#98d0ff' : '#fff'}
              />
            </View>
            <View className='action-btn' onClick={this.handleShare}>
              <AtIcon value='share' size='18' color='#fff'/>
            </View>
          </View>

          {/* 题目详情卡片 */}
          <View className='content-card'>
            <View className='header'>
              <Text className='title'>{question.title}</Text>
              <Text className='meta'>
                最近维护时间 {dayjs(question.updateTime).format('YYYY-MM-DD')}
              </Text>
            </View>

            <View className='stats'>
              <AtTag type='primary' circle>
                <AtIcon value='eye' size='18'/>
                {questionHotspotDetail.viewNum || 0} 次浏览
              </AtTag>
              <AtTag type='primary' circle>
                <AtIcon value='heart' size='18'/>
                {questionHotspotDetail.starNum || 0} 次点赞
              </AtTag>
            </View>

            <TagParser tagList={question.tagList}/>

            <View className='at-article'>
              <View className='at-article__h3'>题目内容</View>
              <View className='at-article__content'>
                <View className='at-article__section'>
                  <View className='at-article__p'>
                    {question.content.replace(/^###\s*/, '')}
                  </View>
                </View>
              </View>
            </View>

            <View className='at-article'>
              <View className='at-article__h3'>参考答案</View>
              <View className='at-article__content'>
                <View className='at-article__section'>
                  <MarkdownRenderer content={question.answer} />
                </View>
              </View>
            </View>

            <View className="signin-button-container">
              <AtButton
                className={`signin-button ${this.state.todaySigned ? 'signed' : ''}`}
                onClick={this.handleSignIn}
                disabled={this.state.todaySigned}
              >
                {this.state.todaySigned ? (
                  <>
                    <AtIcon value="check" size="16" color="#ffffff"/>
                    <Text>今日已签到</Text>
                  </>
                ) : (
                  <Text>双击签到</Text>
                )}
              </AtButton>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}
