import {Component} from 'react';
import {Canvas, Image, ScrollView, Text, View} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {AtButton, AtFab, AtIcon, AtModal, AtModalContent, AtTag} from 'taro-ui';
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
  scrollIntoView: string;
  scrollTop: number;
  showTopBtn: boolean;
  showBottomBtn: boolean;
  viewportHeight: number;
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
    scrollIntoView: ''
    , scrollTop: 0,
    showTopBtn: false,
    showBottomBtn: true,
    viewportHeight: Taro.getSystemInfoSync().windowHeight || 0
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

  // 生成分享卡片
  handleShare = async () => {
    const {question, questionHotspotDetail} = this.state;

    if (!question || !questionHotspotDetail) {
      Taro.showToast({title: '题目尚未加载完成', icon: 'none'});
      return;
    }

    try {
      const systemInfo = await Taro.getSystemInfo();
      const pixelRatio = systemInfo.pixelRatio || 2;
      const canvasWidth = 750;

      await new Promise(resolve => Taro.nextTick(resolve));
      const ctx = Taro.createCanvasContext('shareCanvas');

      ctx.setFontSize(28);
      const lineHeight = 42;

      const headerHeight = 130;
      const margin = 40;
      const titleX = margin + 28;
      const contentWidth = canvasWidth - margin * 2 - 28;
      const qrSize = 240;

      const canvasHeight = 900;

      const tipText = '答案请前往小程序或官网查看';

      const qrInfo = await Taro.getImageInfo({
        src: 'https://rich-tams.oss-cn-beijing.aliyuncs.com/weChatMiniProgramQRCode.jpg'
      });

      ctx.setFillStyle('#ffffff');
      this.drawRoundRect(ctx, 20, 20, canvasWidth - 40, canvasHeight - 40, 20);

      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
      gradient.addColorStop(0, '#111827');
      gradient.addColorStop(1, '#374151');
      ctx.setFillStyle(gradient);
      ctx.fillRect(0, 0, canvasWidth, headerHeight);

      ctx.setFontSize(46);
      ctx.setFillStyle('#ffffff');
      ctx.setTextAlign('center');
      ctx.fillText('RICH 面试刷题平台', canvasWidth / 2, headerHeight - 30);

      let currentY = headerHeight + 30;

      ctx.setFillStyle('#f5f5f5');
      this.drawRoundRect(ctx, margin, currentY, 96, 44, 22);
      ctx.setFillStyle('#111827');
      ctx.setFontSize(45);
      ctx.fillText('【问】', margin + 18, currentY + 30);

      ctx.setFontSize(26);
      ctx.setFillStyle('#6b7280');
      ctx.setTextAlign('left');

      currentY += 72;
      ctx.setFontSize(38);
      ctx.setFillStyle('#111827');
      currentY = this.drawWrappedText(ctx, question.title, titleX, currentY, contentWidth, lineHeight);

      currentY += 40;

      let tagY = currentY + 10;
      let tagX = titleX;
      const tags = (question.tagList || []).slice(0, Math.min(8, (question.tagList || []).length));
      tags.forEach(tag => {
        ctx.setFontSize(24);
        const tagWidth = ctx.measureText(tag).width + 40;
        if (tagX + tagWidth > titleX + contentWidth) {
          tagX = titleX;
          tagY += 56;
        }
        ctx.setFillStyle('#e5e7eb');
        this.drawRoundRect(ctx, tagX, tagY, tagWidth, 46, 23);
        ctx.setFillStyle('#374151');
        ctx.fillText(tag, tagX + 20, tagY + 30);
        tagX += tagWidth + 16;
      });
      currentY = tagY + 80;

      const qrX = (canvasWidth - qrSize) / 2;
      const qrY = currentY;
      ctx.setFillStyle('#f9fafb');
      this.drawRoundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 96, 16);
      ctx.drawImage(qrInfo.path, qrX, qrY, qrSize, qrSize);
      ctx.setFontSize(24);
      ctx.setFillStyle('#6b7280');
      ctx.setTextAlign('center');
      ctx.fillText('微信小程序扫码查看答案', canvasWidth / 2, qrY + qrSize + 42);
      currentY = qrY + qrSize + 96;

      ctx.setFontSize(26);
      ctx.setFillStyle('#374151');
      ctx.setTextAlign('center');
      ctx.fillText(`分享人：${question.user?.userName || 'RICH 用户'}`, canvasWidth / 2, canvasHeight - 120);

      ctx.setFontSize(26);
      ctx.setFillStyle('#111827');
      ctx.setTextAlign('center');
      ctx.fillText('官网 richdu.cn', canvasWidth / 2, canvasHeight - 80);

      ctx.setFontSize(26);
      ctx.setFillStyle('#6b7280');
      ctx.setTextAlign('center');
      ctx.fillText(tipText, canvasWidth / 2, canvasHeight - 40);

      ctx.draw(false, async () => {
        const res = await Taro.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          destWidth: canvasWidth * pixelRatio,
          destHeight: canvasHeight * pixelRatio,
          fileType: 'jpg',
          quality: 0.85
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

  // 进入回答页面
  handleGoAnswer = () => {
    const {question} = this.state;
    if (!question?.id) {
      Taro.showToast({title: '题目未加载', icon: 'none'});
      return;
    }
    Taro.navigateTo({url: `/pages/answer/index?id=${question.id}`});
  };

  scrollToBottom = () => {
    this.setState({scrollIntoView: 'page-bottom'});
    setTimeout(() => this.setState({scrollIntoView: ''}), 50);
  };

  scrollToTop = () => {
    this.setState({scrollIntoView: 'page-top'});
    setTimeout(() => this.setState({scrollIntoView: ''}), 50);
  };

  handleScroll = (e: any) => {
    const detail = e?.detail || {};
    const scrollTop = detail.scrollTop || 0;
    const scrollHeight = detail.scrollHeight || 0;
    const h = this.state.viewportHeight || 0;
    const atTop = scrollTop <= 10;
    const atBottom = scrollTop + h >= scrollHeight - 10;
    this.setState({showTopBtn: !atTop, showBottomBtn: !atBottom});
  };

  // 复制题目内容
  handleCopyContent = () => {
    const {question} = this.state;
    if (!question) {
      Taro.showToast({title: '题目内容尚未加载', icon: 'none'});
      return;
    }

    const contentToCopy = `题目：${question.title}\n\n题目内容：\n${question.content.replace(/^#\s*/, '')}\n\n参考答案：\n${question.answer}`;

    Taro.setClipboardData({
      data: contentToCopy,
      success: () => {
        Taro.showToast({title: '题目内容已复制', icon: 'success'});
      },
      fail: () => {
        Taro.showToast({title: '复制失败，请重试', icon: 'none'});
      }
    });
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

        <ScrollView className='question-detail-page' scrollY scrollWithAnimation
                    scrollIntoView={this.state.scrollIntoView} style={{height: '100vh'}} onScroll={this.handleScroll}>
          <View id='page-top' style={{height: '1px'}}/>
          {/* 顶部操作栏 */}
          <View className='action-bar'>
            <View className='action-btn' onClick={this.handleGoBack}>
              <AtIcon value='chevron-left' size='18' color='#fff'/>
            </View>
            <View className={`action-btn ${this.state.starred ? 'starred' : ''}`} onClick={this.handleStar}>
              <AtIcon
                value='heart-2'
                size='18'
                color={this.state.starred ? '#e9ccff' : '#fff'}
              />
            </View>
            <View className='action-btn' onClick={this.handleCopyContent}>
              <AtIcon value='file-generic' size='18' color='#fff'/>
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
                    {question.content.replace(/^#\s*/, '')}
                  </View>
                </View>
              </View>
            </View>

            <View className='at-article'>
              <View className='at-article__h3'>参考答案</View>
              <View className='at-article__content'>
                <View className='at-article__section'>
                  <MarkdownRenderer content={question.answer}/>
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
            <View className="answer-entry-container">
              <AtButton
                type="primary"
                className="answer-entry-button"
                onClick={this.handleGoAnswer}
              >
                <AtIcon value="edit" size="16" color="#ffffff"/>
                <Text>回答本题</Text>
              </AtButton>
            </View>
          </View>
          <View id='page-bottom' style={{height: '1px'}}/>
        </ScrollView>
        <View className='floating-actions'>
          {this.state.showTopBtn && (
            <AtFab onClick={this.scrollToTop}>
              <AtIcon value='chevron-up' size='16' color='#fff'/>
            </AtFab>
          )}
          {this.state.showBottomBtn && (
            <AtFab onClick={this.scrollToBottom}>
              <AtIcon value='chevron-down' size='16' color='#fff'/>
            </AtFab>
          )}
          <AtFab onClick={this.handleGoAnswer}>
            <AtIcon value='edit' size='16' color='#fff'/>
          </AtFab>
        </View>
      </View>
    );
  }
}
