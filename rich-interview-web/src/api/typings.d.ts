declare namespace API {
  type BaseResponseBoolean_ = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseInt_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type getMockInterviewByIdUsingGETParams = {
    /** id */
    id: string;
  };

  type MockInterviewAddRequest = {
    difficulty?: string;
    jobPosition?: string;
    workExperience?: string;
  };

  type BaseResponseMockInterview_ = {
    code?: number;
    data?: MockInterview;
    message?: string;
  };

  type BaseResponsePageMockInterview_ = {
    code?: number;
    data?: PageMockInterview_;
    message?: string;
  };

  type PageMockInterview_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: MockInterview[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type MockInterviewQueryRequest = {
    createTime?: string;
    current?: number;
    difficulty?: string;
    id?: number;
    jobPosition?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    updateTime?: string;
    userId?: number;
    workExperience?: string;
  };

  type MockInterview = {
    createTime?: string;
    difficulty?: string;
    id?: number;
    isDelete?: number;
    jobPosition?: string;
    messages?: string;
    status?: number;
    updateTime?: string;
    userId?: number;
    workExperience?: string;
  };

  type setDefaultRoleUsingPUTParams = {
    /** role */
    role: string;
  };

  type setMaxWaitTimeUsingPUTParams = {
    /** milliseconds */
    milliseconds: number;
  };

  type queryAIUsingPOSTParams = {
    /** question */
    question: string;
  };

  type BaseResponseLoginUserVO_ = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type doChatEventUsingPOSTParams = {
    event?: string;
    id?: number;
    message?: string;
  };

  type BaseResponseString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponsePagePost_ = {
    code?: number;
    data?: PagePost_;
    message?: string;
  };

  type BaseResponsePagePostVO_ = {
    code?: number;
    data?: PagePostVO_;
    message?: string;
  };

  type BaseResponsePageQuestion_ = {
    code?: number;
    data?: PageQuestion_;
    message?: string;
  };

  type BaseResponsePageQuestionBank_ = {
    code?: number;
    data?: PageQuestionBank_;
    message?: string;
  };

  type BaseResponsePageQuestionBankQuestion_ = {
    code?: number;
    data?: PageQuestionBankQuestion_;
    message?: string;
  };

  type BaseResponsePageQuestionBankQuestionVO_ = {
    code?: number;
    data?: PageQuestionBankQuestionVO_;
    message?: string;
  };

  type BaseResponsePageQuestionBankVO_ = {
    code?: number;
    data?: PageQuestionBankVO_;
    message?: string;
  };

  type BaseResponsePageQuestionVO_ = {
    code?: number;
    data?: PageQuestionVO_;
    message?: string;
  };

  type BaseResponsePageUser_ = {
    total(total: any): number | undefined;
    records: never[];
    code?: number;
    data?: PageUser_;
    message?: string;
  };

  type BaseResponsePageUserVO_ = {
    code?: number;
    data?: PageUserVO_;
    message?: string;
  };

  type BaseResponsePostVO_ = {
    code?: number;
    data?: PostVO;
    message?: string;
  };

  type BaseResponseQuestionBankQuestionVO_ = {
    code?: number;
    data?: QuestionBankQuestionVO;
    message?: string;
  };

  type BaseResponseQuestionBankVO_ = {
    code?: number;
    data?: QuestionBankVO;
    message?: string;
  };

  type BaseResponseQuestionVO_ = {
    code?: number;
    data?: QuestionVO;
    message?: string;
  };

  type BaseResponseString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseUser_ = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseUserVO_ = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type checkUsingGETParams = {
    /** echostr */
    echostr?: string;
    /** nonce */
    nonce?: string;
    /** signature */
    signature?: string;
    /** timestamp */
    timestamp?: string;
  };

  type DeleteRequest = {
    id?: number;
  };

  type getPostVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getQuestionBankQuestionVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getQuestionBankVOByIdUsingGETParams = {
    content?: string;
    current?: number;
    description?: string;
    id?: number;
    notId?: number;
    pageSize?: number;
    picture?: string;
    queryQuestionsFlag?: boolean;
    questionsCurrent?: number;
    questionsPageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    title?: string;
    userId?: number;
  };

  type getQuestionVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type LoginUserVO = {
    createTime?: string;
    id?: number;
    updateTime?: string;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
    phoneNumber?: string;
    email?: string;
    grade?: string;
    workExperience?: string;
    expertiseDirection?: string;
    previousQuestionID?: number;
  };

  type OrderItem = {
    asc?: boolean;
    column?: string;
  };

  type PagePost_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: Post[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PagePostVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: PostVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageQuestion_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: Question[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageQuestionBank_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionBank[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageQuestionBankQuestion_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionBankQuestion[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageQuestionBankQuestionVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionBankQuestionVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageQuestionBankVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionBankVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageQuestionVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUser_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: User[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUserVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: UserVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type Post = {
    content?: string;
    createTime?: string;
    favourNum?: number;
    id?: number;
    isDelete?: number;
    tags?: string;
    thumbNum?: number;
    title?: string;
    updateTime?: string;
    userId?: number;
  };

  type PostAddRequest = {
    content?: string;
    tags?: string[];
    title?: string;
  };

  type PostEditRequest = {
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type PostFavourAddRequest = {
    postId?: number;
  };

  type PostFavourQueryRequest = {
    current?: number;
    pageSize?: number;
    postQueryRequest?: PostQueryRequest;
    sortField?: string;
    sortOrder?: string;
    userId?: number;
  };

  type PostQueryRequest = {
    content?: string;
    current?: number;
    favourUserId?: number;
    id?: number;
    notId?: number;
    orTags?: string[];
    pageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    tags?: string[];
    title?: string;
    userId?: number;
  };

  type PostThumbAddRequest = {
    postId?: number;
  };

  type PostUpdateRequest = {
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type PostVO = {
    content?: string;
    createTime?: string;
    favourNum?: number;
    hasFavour?: boolean;
    hasThumb?: boolean;
    id?: number;
    tagList?: string[];
    thumbNum?: number;
    title?: string;
    updateTime?: string;
    user?: UserVO;
    userId?: number;
  };

  type Question = {
    answer?: string;
    content?: string;
    createTime?: string;
    editTime?: string;
    favourNum?: number;
    id?: number;
    isDelete?: number;
    needVip?: number;
    priority?: number;
    reviewMessage?: string;
    reviewStatus?: number;
    reviewTime?: string;
    reviewerId?: number;
    source?: string;
    tags?: string;
    thumbNum?: number;
    title?: string;
    updateTime?: string;
    userId?: number;
    viewNum?: number;
    questionBankId?: number;
  };

  type QuestionAddRequest = {
    answer?: string;
    questionBankId?: number;
    content?: string;
    tags?: string[];
    title?: string;
  };

  type QuestionBank = {
    createTime?: string;
    description?: string;
    editTime?: string;
    id?: number;
    isDelete?: number;
    picture?: string;
    priority?: number;
    reviewMessage?: string;
    reviewStatus?: number;
    reviewTime?: string;
    reviewerId?: number;
    title?: string;
    updateTime?: string;
    userId?: number;
    viewNum?: number;
  };

  type QuestionBankAddRequest = {
    description?: string;
    content?: string;
    picture?: string;
    title?: string;
  };

  type QuestionBankEditRequest = {
    content?: string;
    id?: number;
    picture?: string;
    title?: string;
  };

  type QuestionBankQueryRequest = {
    content?: string;
    current?: number;
    description?: string;
    id?: number;
    notId?: number;
    pageSize?: number;
    picture?: string;
    queryQuestionsFlag?: boolean;
    questionsCurrent?: number;
    questionsPageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    title?: string;
    userId?: number;
  };

  type QuestionBankQuestion = {
    createTime?: string;
    id?: number;
    questionBankId?: number;
    questionId?: number;
    questionOrder?: number;
    updateTime?: string;
    userId?: number;
  };

  type QuestionBankQuestionAddRequest = {
    questionBankId?: number;
    questionId?: number;
  };

  type QuestionBankQuestionQueryRequest = {
    current?: number;
    id?: number;
    notId?: number;
    pageSize?: number;
    questionBankId?: number;
    questionId?: number;
    sortField?: string;
    sortOrder?: string;
    userId?: number;
  };

  type QuestionBankQuestionRemoveRequest = {
    questionBankId?: number;
    questionId?: number;
  };

  type QuestionBankQuestionUpdateRequest = {
    id?: number;
    questionBankId?: number;
    questionId?: number;
  };

  type QuestionBankQuestionVO = {
    createTime?: string;
    id?: number;
    questionBankId?: number;
    questionId?: number;
    tagList?: string[];
    updateTime?: string;
    user?: UserVO;
    userId?: number;
  };

  type QuestionBankUpdateRequest = {
    description?: string;
    content?: string;
    id?: number;
    picture?: string;
    title?: string;
  };

  type QuestionBankVO = {
    createTime?: string;
    description?: string;
    id?: number;
    picture?: string;
    questionsPage?: PageQuestion_;
    title?: string;
    updateTime?: string;
    user?: UserVO;
    userId?: number;
  };

  type QuestionEditRequest = {
    answer?: string;
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type QuestionBankQuestionBatchAddOrUpdateRequest = {
    questionBankId?: number;
    questionIdList?: number[];
  };

  type QuestionQueryRequest = {
    answer?: string;
    content?: string;
    current?: number;
    id?: number;
    notId?: number;
    pageSize?: number;
    questionBankId?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    tags?: string[];
    title?: string;
    userId?: number;
  };

  type QuestionUpdateRequest = {
    answer?: string;
    questionBankId?: number;
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type incrementFieldUsingPOSTParams = {
    /** fieldType */
    fieldType: string;
    /** questionId */
    questionId: number;
  };

  type incrementBankFieldUsingPOSTParams = {
    /** fieldType */
    fieldType: string;
    /** questionBankId */
    questionBankId: number;
  };

  type QuestionHotspotUpdateRequest = {
    collectNum?: number;
    commentNum?: number;
    forwardNum?: number;
    questionId?: number;
    starNum?: number;
    viewNum?: number;
  };

  type QuestionHotspot = {
    collectNum?: number;
    commentNum?: number;
    createTime?: string;
    forwardNum?: number;
    id?: number;
    questionId?: number;
    starNum?: number;
    updateTime?: string;
    viewNum?: number;
  };

  type PageQuestionBankHotspot_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionBankHotspot[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type QuestionBankHotspot = {
    collectNum?: number;
    commentNum?: number;
    createTime?: string;
    forwardNum?: number;
    id?: number;
    questionBankId?: number;
    starNum?: number;
    updateTime?: string;
    viewNum?: number;
  };

  type QuestionBankHotspotQueryRequest = {
    collectNum?: number;
    commentNum?: number;
    current?: number;
    forwardNum?: number;
    pageSize?: number;
    questionBankId?: number;
    sortField?: string;
    sortOrder?: string;
    starNum?: number;
    viewNum?: number;
  };

  type QuestionBankHotspotUpdateRequest = {
    collectNum?: number;
    commentNum?: number;
    forwardNum?: number;
    questionBankId?: number;
    starNum?: number;
    viewNum?: number;
  };

  type BaseResponseQuestionBankHotspotVO_ = {
    code?: number;
    data?: QuestionBankHotspotVO;
    message?: string;
  };

  type getQuestionBankHotspotVOByQuestionBankIdUsingGETParams = {
    /** questionBankId */
    questionBankId: number;
  };

  type BaseResponsePageQuestionBankHotspot_ = {
    code?: number;
    data?: PageQuestionBankHotspot_;
    message?: string;
  };

  type BaseResponsePageQuestionBankHotspotVO_ = {
    code?: number;
    data?: PageQuestionBankHotspotVO_;
    message?: string;
  };

  type QuestionBankHotspotVO = {
    collectNum?: number;
    commentNum?: number;
    createTime?: string;
    description?: string;
    forwardNum?: number;
    id?: number;
    questionBankId?: number;
    starNum?: number;
    title?: string;
    updateTime?: string;
    viewNum?: number;
  };

  type PageQuestionBankHotspotVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionBankHotspotVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type getQuestionHotspotVOByQuestionIdUsingGETParams = {
    /** questionId */
    questionId: number;
  };

  type PageQuestionBankHotspot_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionBankHotspot[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageQuestionHotspot_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionHotspot[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageQuestionHotspotVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionHotspotVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type QuestionBankHotspot = {
    collectNum?: number;
    commentNum?: number;
    createTime?: string;
    forwardNum?: number;
    id?: number;
    questionBankId?: number;
    starNum?: number;
    updateTime?: string;
    viewNum?: number;
  };

  type QuestionBankHotspotAddRequest = {
    content?: string;
    tags?: string[];
    title?: string;
  };

  type QuestionBankHotspotEditRequest = {
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type PageQuestionBankHotspotVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionBankHotspotVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type getQuestionBankHotspotVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type BaseResponseQuestionHotspotVO_ = {
    code?: number;
    data?: QuestionHotspotVO;
    message?: string;
  };

  type BaseResponsePageQuestionHotspot_ = {
    code?: number;
    data?: PageQuestionHotspot_;
    message?: string;
  };

  type BaseResponsePageQuestionHotspotVO_ = {
    code?: number;
    data?: PageQuestionHotspotVO_;
    message?: string;
  };

  type QuestionHotspotQueryRequest = {
    collectNum?: number;
    commentNum?: number;
    current?: number;
    forwardNum?: number;
    pageSize?: number;
    questionId?: number;
    sortField?: string;
    sortOrder?: string;
    starNum?: number;
    viewNum?: number;
  };

  type QuestionHotspotVO = {
    answer?: string;
    collectNum?: number;
    commentNum?: number;
    content?: string;
    createTime?: string;
    forwardNum?: number;
    id?: number;
    questionId?: number;
    starNum?: number;
    tagList?: string[];
    title?: string;
    updateTime?: string;
    viewNum?: number;
  };

  type QuestionVO = {
    answer?: string;
    content?: string;
    createTime?: string;
    id?: number;
    tagList?: string[];
    title?: string;
    updateTime?: string;
    user?: UserVO;
    userId?: number;
    questionBankId?: number;
    tags?: string;
    reviewMessage?: string;
    reviewStatus?: number;
    reviewTime?: string;
    reviewerId?: number;
    source?: string;
  };

  type QuestionReview = {
    answer?: string;
    content?: string;
    createTime?: string;
    editTime?: string;
    id?: number;
    isDelete?: number;
    reviewStatus?: number;
    tags?: string;
    title?: string;
    updateTime?: string;
    userId?: number;
  };

  type QuestionReviewAddRequest = {
    answer?: string;
    content?: string;
    tags?: string[];
    title?: string;
  };

  type approveQuestionReviewUsingPOSTParams = {
    /** reviewId */
    reviewId: number;
  };

  type BaseResponsePageQuestionReview_ = {
    code?: number;
    data?: PageQuestionReview_;
    message?: string;
  };

  type PageQuestionReview_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: QuestionReview[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type rejectQuestionReviewUsingPOSTParams = {
    /** reviewId */
    reviewId: number;
  };

  type QuestionReviewQueryRequest = {
    answer?: string;
    content?: string;
    current?: number;
    id?: number;
    notId?: number;
    pageSize?: number;
    reviewStatus?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    tags?: string[];
    title?: string;
    userId?: number;
  };

  type QuestionReviewUpdateRequest = {
    answer?: string;
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type uploadFileUsingPOSTParams = {
    biz?: string;
  };

  type User = {
    createTime?: string;
    editTime?: string;
    id?: number;
    isDelete?: number;
    mpOpenId?: string;
    unionId?: string;
    updateTime?: string;
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userPassword?: string;
    userProfile?: string;
    userRole?: string;
    phoneNumber?: string;
    email?: string;
    grade?: string;
    workExperience?: string;
    expertiseDirection?: string;
  };

  type UserAddRequest = {
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userRole?: string;
    phoneNumber?: string;
    email?: string;
    grade?: string;
    workExperience?: string;
    expertiseDirection?: string;
  };

  type userLoginByWxOpenUsingGETParams = {
    /** code */
    code: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserQueryRequest = {
    current?: number;
    id?: number;
    mpOpenId?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    unionId?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
    phoneNumber?: string;
    email?: string;
    grade?: string;
    workExperience?: string;
    expertiseDirection?: string;
  };

  type UserRegisterRequest = {
    checkPassword?: string;
    userAccount?: string;
    userPassword?: string;
    userAavatar?: string;
    userName?: string;
    userRole?: string;
    phoneNumber?: string;
    email?: string;
    grade?: string;
    workExperience?: string;
    expertiseDirection?: string;
  };

  type UserUpdateMyRequest = {
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userPassword?: string;
    previousQuestionID?: number;
    phoneNumber?: string;
    email?: string;
    grade?: string;
    workExperience?: string;
    expertiseDirection?: string;
  };

  type UserUpdateRequest = {
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
    phoneNumber?: string;
    email?: string;
    grade?: string;
    workExperience?: string;
    expertiseDirection?: string;
  };

  type UserVO = {
    createTime?: string;
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
    phoneNumber?: string;
    email?: string;
    grade?: string;
    workExperience?: string;
    expertiseDirection?: string;
    previousQuestionID?: number;
  };

  type getUserSignInRecordUsingGETParams = {
    /** year */
    year?: number;
  };

  type BaseResponseListInt_ = {
    code?: number;
    data?: number[];
    message?: string;
  };

  type FileInfo = {
    attr?: Record<string, any>;
    basePath?: string;
    contentType?: string;
    createTime?: string;
    ext?: string;
    fileAcl?: Record<string, any>;
    filename?: string;
    hashInfo?: Record<string, any>;
    id?: string;
    metadata?: Record<string, any>;
    objectId?: string;
    objectType?: string;
    originalFilename?: string;
    path?: string;
    platform?: string;
    size?: number;
    thContentType?: string;
    thFileAcl?: Record<string, any>;
    thFilename?: string;
    thMetadata?: Record<string, any>;
    thSize?: number;
    thUrl?: string;
    thUserMetadata?: Record<string, any>;
    uploadId?: string;
    uploadStatus?: number;
    url?: string;
    userMetadata?: Record<string, any>;
  };

  type getLearnPathVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type BaseResponseLearnPathVO_ = {
    code?: number;
    data?: LearnPathVO;
    message?: string;
  };

  type BaseResponsePageLearnPath_ = {
    code?: number;
    data?: PageLearnPath_;
    message?: string;
  };

  type BaseResponsePageLearnPathVO_ = {
    code?: number;
    data?: PageLearnPathVO_;
    message?: string;
  };

  type LearnPath = {
    answer?: string;
    content?: string;
    createTime?: string;
    editTime?: string;
    id?: number;
    isDelete?: number;
    tags?: string;
    title?: string;
    updateTime?: string;
    userId?: number;
  };

  type LearnPathAddRequest = {
    answer?: string;
    content?: string;
    tags?: string[];
    title?: string;
  };

  type LearnPathEditRequest = {
    answer?: string;
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type LearnPathQueryRequest = {
    answer?: string;
    content?: string;
    current?: number;
    id?: number;
    notId?: number;
    pageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    tags?: string[];
    title?: string;
    userId?: number;
  };

  type PageLearnPath_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: LearnPath[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageLearnPathVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: LearnPathVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type LearnPathUpdateRequest = {
    answer?: string;
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type LearnPathVO = {
    content?: string;
    answer?: string;
    createTime?: string;
    id?: number;
    tagList?: string[];
    title?: string;
    updateTime?: string;
    user?: UserVO;
    userId?: number;
  };

  type BaseResponseListCommentVO_ = {
    code?: number;
    data?: CommentVO[];
    message?: string;
  };

  type CommentAddRequest = {
    content?: string;
    questionId?: number;
  };

  type CommentQueryRequest = {
    content?: string;
    createTime?: string;
    current?: number;
    id?: number;
    pageSize?: number;
    questionId?: number;
    sortField?: string;
    sortOrder?: string;
    thumbNum?: number;
    userId?: number;
  };

  type CommentVO = {
    content?: string;
    createTime?: string;
    editTime?: string;
    id?: number;
    questionId?: number;
    thumbNum?: number;
    updateTime?: string;
    user?: UserVO;
    userId?: number;
  };

  type getCommentVOByQuestionIdUsingGETParams = {
    /** questionId */
    questionId?: number;
  };

  type PageCommentVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: CommentVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type BaseResponsePageCommentVO_ = {
    code?: number;
    data?: PageCommentVO_;
    message?: string;
  };
}
