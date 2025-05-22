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
    previousQuestionID ?: number;
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
  };

  type UserAddRequest = {
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userRole?: string;
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
  };

  type UserRegisterRequest = {
    checkPassword?: string;
    userAccount?: string;
    userPassword?: string;
    userAavatar?: string;
    userName?: string;
    userRole?: string;
  };

  type UserUpdateMyRequest = {
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userPassword?: string;
    previousQuestionID?: number;
  };

  type UserUpdateRequest = {
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserVO = {
    createTime?: string;
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
    previousQuestionID ?: number;
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
}
