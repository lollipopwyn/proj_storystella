import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// API 요청에 사용될 엔드포인트 URL을 import함
import {
  GET_BOOK_LIST_API_URL,
  GET_BOOK_REVIEWS_API_URL,
  GET_BOOK_DETAIL_API_URL,
  GET_SEARCH_BOOKS_API_URL,
  GET_BOOK_BY_CATEGORY_API_URL,
  GET_BOOK_ALL_CATEGORIES_API_URL,
  GET_NEW_BOOK_API_URL,
  GET_BEST_BOOK_API_URL,
  GET_COMMUNITY_POSTS_API_URL,
  CREATE_COMMUNITY_POST_API_URL,
  CREATE_COMMENT_API_URL,
  // 다른 엔드포인트 URL
} from '../../../util/apiUrl';
import {
  postRequest,
  getRequest,
  putRequest,
  deleteRequest,
} from '../../../util/requestMethods';

//  1. 동적 fetch Thunk 생성기-----------------------
//    actionType (예: fetchGetBookList)
//    apiURL - 엔드포인트 URL
//    requestMethod - HTTP 요청 함수 (예: getRequest)
const createApiThunk = (actionType, apiURL, requestMethod) => {
  return createAsyncThunk(actionType, async (params) => {
    const options = {
      ...(requestMethod === getRequest ? {} : { body: JSON.stringify(params) }),
    };
    return await requestMethod(apiURL, options);
  });
};

// 2. 각 Thunks 정의---------------------------------
//    특정 API 요청을 위해 createApiThunk를 호출하여 Thunk 함수 생성

//북 리스트 관련 Thunks
export const fetchBookListData = createApiThunk(
  'api/fetchGetBookList',
  GET_BOOK_LIST_API_URL,
  getRequest
);

// 북 상세페이지 Thunks
export const fetchBookDetailData = createApiThunk(
  'api/fetchGetBookDetail',
  async (bookId) => GET_BOOK_DETAIL_API_URL(bookId),
  getRequest
);

// 북 리뷰 Thunks
export const fetchBookReviewsData = createApiThunk(
  'api/fetchGetBookReviews',
  async (bookId) => GET_BOOK_REVIEWS_API_URL(bookId),
  getRequest
);

// 검색 관련 Thunks
export const fetchSearchBooksData = createApiThunk(
  'api/fetchSearchBooks',
  GET_SEARCH_BOOKS_API_URL,
  getRequest
);

// 카테고리 필터 조회 Thunks
export const fetchBookByCategoryData = createApiThunk(
  'api/fetchBookByCategory',
  GET_BOOK_BY_CATEGORY_API_URL,
  getRequest
);

// 책 카테고리 Thunks
export const fetchBookAllCategoriesData = createApiThunk(
  'api/fetchBookAllCategories',
  GET_BOOK_ALL_CATEGORIES_API_URL,
  getRequest
);

// 신간 도서 불러오기 Thunks
export const fetchNewBookData = createApiThunk(
  'api/fetchNewBook',
  GET_NEW_BOOK_API_URL,
  getRequest
);

// 베스트셀러 불러오기 Thunks
export const fetchBestBookData = createApiThunk(
  'api/fetchBestBook',
  GET_BEST_BOOK_API_URL,
  getRequest
);

// 커뮤니티 게시글 가져오기 Thunk
export const fetchCommunityPostsData = createAsyncThunk(
  'api/fetchCommunityPosts',
  async ({ viewType, member_num }, { rejectWithValue }) => {
    const visibility = viewType === 'Only me' ? 'false' : 'true';
    const url = `${GET_COMMUNITY_POSTS_API_URL}?visibility=${visibility}${
      member_num ? `&member_num=${member_num}` : ''
    }`;

    console.log(
      'Requesting posts with visibility:',
      visibility,
      'and member_num:',
      member_num
    );

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error(
          'Failed to fetch posts:',
          response.status,
          response.statusText
        );
        return rejectWithValue('Failed to fetch posts');
      }

      const data = await response.json();
      console.log('Fetched posts data:', data); // 서버로부터 받아온 데이터 확인
      return data;
    } catch (error) {
      console.error('Network error:', error);
      return rejectWithValue('Network error');
    }
  }
);

// 커뮤니티 새 게시글 생성 Thunk
export const createCommunityPostData = createAsyncThunk(
  'api/createCommunityPost',
  async (postData, { getState, rejectWithValue }) => {
    try {
      // 현재 로그인한 사용자 정보에서 member_num 가져오기
      const { auth } = getState();
      const member_num = auth.user?.memberNum;

      // member_num이 postData에 포함되지 않은 경우 추가
      const requestData = {
        ...postData,
        member_num: postData.member_num || member_num,
      };

      console.log('Sending post data to server:', requestData); // 서버에 보내는 데이터 확인

      // postRequest 함수 호출
      const data = await postRequest(
        CREATE_COMMUNITY_POST_API_URL,
        requestData
      );

      // 성공적인 요청 처리
      console.log('Post created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating post:', error.message);
      return rejectWithValue(
        error.message || 'Network error or failed to parse response.'
      );
    }
  }
);

// 커뮤니티 댓글 생성 Thunk
export const addCommentToPost = createAsyncThunk(
  'api/addCommentToPost',
  async (commentData, { getState, rejectWithValue }) => {
    try {
      // 현재 로그인한 사용자 정보에서 member_num 가져오기
      const { auth } = getState();
      const member_num = auth.user?.memberNum;

      // member_num이 commentData에 포함되지 않은 경우 추가
      const requestData = {
        ...commentData,
        member_num: commentData.member_num || member_num,
      };

      console.log('Sending comment data to server:', requestData); // 서버에 보내는 데이터 확인

      // postRequest 함수 호출
      const data = await postRequest(CREATE_COMMENT_API_URL, requestData);

      // 성공적인 요청 처리
      console.log('Comment created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating comment:', error.message);
      return rejectWithValue(
        error.message || 'Network error or failed to parse response.'
      );
    }
  }
);

// 댓글 목록 가져오기 Thunk
export const fetchCommentsByPostId = createAsyncThunk(
  'community/fetchCommentsByPostId',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${GET_COMMUNITY_POSTS_API_URL}/${postId}/comments`
      );

      if (response.status === 404) {
        // 댓글이 없는 경우 빈 배열 반환
        return [];
      }

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCommunityPostDetail = createAsyncThunk(
  'community/fetchPostDetail',
  async (postId, thunkAPI) => {
    try {
      const response = await fetch(`${GET_COMMUNITY_POSTS_API_URL}/${postId}`);

      // 응답이 JSON 형식이 아니면 에러 던지기
      const contentType = response.headers.get('content-type');
      if (
        !response.ok ||
        !contentType ||
        !contentType.includes('application/json')
      ) {
        throw new Error(
          'Failed to fetch post details or invalid response format'
        );
      }

      const data = await response.json();
      console.log('Fetched Post Detail:', data); // 서버로부터 받아온 데이터 확인
      return data; // 단일 게시글 반환
    } catch (error) {
      console.error('Error fetching post details:', error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// 다른 관련 Thunks생성

// 3. 비동기 API 호출 처리------------------------------
// fulfilled 상태를 처리하는 핸들러 함수 생성
const handleFullfilled = (stateKey) => (state, action) => {
  state[stateKey] = Array.isArray(action.payload)
    ? action.payload //배열일 경우 그대로 state[stateKey]에 할당
    : action.payload.data || action.payload; //객체일 경우 data 속성을 우선적으로 할당하고, 만약 data가 없다면 action.payload 자체를 할당
  state.isLoading = false;
};

// rejected 상태를 처리하는 핸들러 함수
const handleRejected = (state, action) => {
  state.isLoading = false;
  state.isError = true;
  state.errorMessage = action.error.message;
};

const handlePending = (state) => {
  state.isLoading = true;
  state.isError = false;
  state.errorMessage = '';
};

// 4. apiSlice 슬라이스 생성--------------------------
//    Redux 슬라이스를 생성하여 초기 상태와 비동기 액션의 상태 관리 설정
const apiSlice = createSlice({
  name: 'api',
  initialState: {
    fetchGetBookList: [],
    fetchGetBookDetail: null,
    fetchGetBookReviews: [],
    fetchSearchBooks: null,
    fetchBookByCategory: null,
    fetchBookAllCategories: [],
    fetchNewBookData: [],
    fetchBestBookData: [],
    fetchCommunityPosts: [],
    postDetail: null,
    comments: [], // 초기 상태를 빈 배열로 설정
    createCommunityPost: null,
    addComment: null,
    isLoading: false,
    // 다른 api슬라이스 초기 상태 지정
    isError: false,
    errorMessage: '',
  },

  // 비동기 액션을 처리하는 extraReducers 설정
  extraReducers: (builder) => {
    builder
      // 북 리스트 -----------------------------------------------------
      .addCase(
        fetchBookListData.fulfilled,
        handleFullfilled('fetchGetBookList')
      )
      .addCase(fetchBookListData.rejected, handleRejected)
      // 북 리뷰-----------------------------------------------------
      .addCase(
        fetchBookReviewsData.fulfilled,
        handleFullfilled('fetchGetBookReviews')
      )
      .addCase(fetchBookReviewsData.rejected, handleRejected)
      // 북 상세페이지-----------------------------------------------------
      .addCase(
        fetchBookDetailData.fulfilled,
        handleFullfilled('fetchGetBookDetail')
      )
      .addCase(fetchBookDetailData.rejected, handleRejected)
      .addCase(fetchBookDetailData.pending, handlePending)
      // -----------------------------------------------------
      .addCase(
        fetchSearchBooksData.fulfilled,
        handleFullfilled('fetchSearchBooks')
      )
      .addCase(fetchSearchBooksData.rejected, handleRejected)

      .addCase(
        fetchBookByCategoryData.fulfilled,
        handleFullfilled('fetchBookByCategory')
      )
      .addCase(fetchBookByCategoryData.rejected, handleRejected)

      .addCase(
        fetchBookAllCategoriesData.fulfilled,
        handleFullfilled('fetchBookAllCategories')
      )
      .addCase(fetchBookAllCategoriesData.rejected, handleRejected)

      .addCase(fetchNewBookData.fulfilled, handleFullfilled('fetchNewBookData'))
      .addCase(fetchNewBookData.rejected, handleRejected)

      .addCase(
        fetchBestBookData.fulfilled,
        handleFullfilled('fetchBestBookData')
      )
      .addCase(fetchBestBookData.rejected, handleRejected)

      // 여기부터 커뮤니티 게시글 처리
      .addCase(
        fetchCommunityPostsData.fulfilled,
        handleFullfilled('fetchCommunityPosts')
      )
      .addCase(fetchCommunityPostsData.rejected, handleRejected)

      .addCase(
        createCommunityPostData.fulfilled,
        handleFullfilled('createCommunityPost')
      )
      .addCase(createCommunityPostData.rejected, handleRejected)

      .addCase(fetchCommunityPostDetail.pending, handlePending)
      .addCase(
        fetchCommunityPostDetail.fulfilled,
        handleFullfilled('postDetail')
      )
      .addCase(fetchCommunityPostDetail.rejected, handleRejected)

      // 댓글 목록 가져오기 처리
      .addCase(fetchCommentsByPostId.pending, handlePending)
      .addCase(fetchCommentsByPostId.fulfilled, (state, action) => {
        state.comments = action.payload; // 댓글 목록 상태 업데이트
        state.isLoading = false;
      })
      .addCase(fetchCommentsByPostId.rejected, handleRejected)

      // 댓글 추가 처리
      .addCase(addCommentToPost.pending, handlePending)
      .addCase(addCommentToPost.fulfilled, (state, action) => {
        state.comments.push(action.payload); // comments 배열에 새 댓글 추가
        state.isLoading = false;
      })
      .addCase(addCommentToPost.rejected, handleRejected);
    // -----------------------------------------------------여기까지 커뮤니티
    // 다른 extraReducers 설정
  },
});

export default apiSlice.reducer;
