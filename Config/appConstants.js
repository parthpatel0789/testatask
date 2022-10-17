const SERVER = {
  APP_NAME: "Test Task",
  JWT_SECRET_KEY: "MaEHqzXzdWrCS6TS",
  THUMB_WIDTH: 50,
  THUMB_HEIGHT: 50,
  adminOTPSms: `OTP is {otp} Use it to verify your mobile number on IQarena\n09rfGRpVzeP`,
  adminOTPNumber: "+917990810440",
  refferalPercentage: 10,
  examQuestionPadding: 1,
  winningTAXPercentage: 31.2,
  taxableAmount: 10000,
  minimumPayoutAmount: 10,
  Login: {
    subject: "Login Details",
    body: `<b>Welcome, {name}</b><p>Here's your login information:  </p>
    <p><b>email: </b>{email}</p>
    <p><b>password: </b>{password}</p>`,
  },
  otpEmail: {
    subject: "OTP Verification",
    body: `<p>Hi</p><p>Here's the OTP - <b>{otp}</b> </p>`,
  },
  RejectEmail: {
    subject: "REJECT Verification",
    body: `<p>Hi</p><p>Here's the reject reason - <b>{reason}</b> </p>`,
  },
};

const DATABASE = {
  initialMoney: 50,
  TRANSECTION_STATUS: {
    PENDING: "PENDING",
    DECLINED: "DECLINED",
    SUCCESS: "SUCCESS",
  },
  PROFILE_PIC_PREFIX: {
    ORIGINAL: "Pic_",
    THUMB: "Thumb_",
  },
  PRODUCT_STATUS: {
    STOCK: "STOCK",
    OUTOFSTOCK: "OUTOFSTOCK",
  },
  USER_TYPE: {
    ADMIN: "ADMIN",
    VENDOR: "VENDOR",
    USER: "USER",
  },
  OTP_TYPE: {
    EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
    FORGOT_PASSWORD: "FORGOT_PASSWORD",
    PHONE_VERIFICATION: "PHONE_VERIFICATION",
    ADMIN_VERIFICATION: "ADMIN_VERIFICATION",
  },
  CHAT_TYPE: {
    PRIVATE: "PRIVATE",
    GROUP: "GROUP",
  },
  REQUEST_STATUS: {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  },
  MEDIA_TYPE: {
    VIDEO: "VIDEO",
    IMAGE: "IMAGE",
    TEXT: "TEXT",
    OTHER: "OTHER",
  },
  ACTIVITY_TYPE: {
    EMAIL_SEND: 1,
    NEW_TASK: 2,
    TASK_COMPLETED: 3,
    NOTES_ADDED: 4,
    NOTES_UPDATED: 5,
    NOTES_DELETED: 6,
    TASK_INCOMPLETED: 7,
    TASK_DELETED: 8,
  },
  DEAL_ACTIVITY_TYPE: {
    DEAL_CREATED: 1,
    NOTE_CREATED: 2,
    EMAIL_SENT: 3,
    MOVED_FROM: 4,
  },
  firstFiveReward: {
    min: 1,
    max: 25,
  },
  sixthReward: {
    min: 26,
    max: 50,
  },
  TRANSECTIONS: {
    BOOKING: "Booking",
  },
  ORDER_STATUS: {
    DISPATCHED: 'DISPATCHED',
    UNSHIPPED: 'UNSHIPPED',
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED',
    REFUND: 'REFUND',
    EXCHANGE: 'EXCHANGE',
    RETURN: 'RETURN'
  },
  PAYMENT_MODE: {
    COD: 'COD',
    ONLINE: 'ONLINE'
  },
  DISCOUNT_TYPE: {
    PERCENTAGE: 'PERCENTAGE',
    AMOUNT: 'AMOUNT'
  },
  OFFER_STATUS: {
    ACTIVE: 'ACTIVE',
    EXPIRY: 'EXPIRY'
  },
  DISCOUNT_CODE_METHOD: {
    CODE: 'CODE',
    AUTOMATIC: 'AUTOMATIC'
  },
  BANNER_TYPE: {
    BANNER: 'BANNER',
    SINGLEOFFERBANNER: 'SINGLEOFFERBANNER',
    TOPCATEGORIES: 'TOPCATEGORIES',
    THREEBANNER: 'THREEBANNER',
    TWOBANNER: 'TWOBANNER',
    TOPBRAND: 'TOPBRAND',
    SINGLEBANNER: 'SINGLEBANNER',
    LATESTOFFER: 'LATESTOFFER'
  },
};

const STATUS_MSG = {
  ERROR: {
    DOB_MISSING: {
      statusCode: 405,
      customMessage: "Date of birth is missing",
      type: "DATE_OF_BIRTH_IS_MISSING",
    },
    DOB_NOT_ELIGIBLE: {
      statusCode: 405,
      customMessage: "user's Date of Birth is not eligible",
      type: "DATE_OF_BIRTH_IS_NOT_ELIGIBLE",
    },
    TOKEN_EXPIRED: {
      statusCode: 401,
      customMessage: "Your account logged in from somewhere else.",
      type: "TOKEN_ALREADY_EXPIRED",
    },
    BLOCKED: {
      statusCode: 405,
      customMessage:
        "This account is blocked by Admin. Please contact support team to activate your account.",
      type: "BLOCKED",
    },
    ALREADY_ENROLLED: {
      statusCode: 405,
      customMessage: "already enrolled in exam",
      type: "ALREADY_ENROLLED",
    },
    QUESTION_ALLREADY_EXISTS: {
      statusCode: 405,
      customMessage: "question already exists",
      type: "QUESTION_ALLREADY_EXISTS",
    },
    NOT_VERIFIED: {
      statusCode: 405,
      customMessage: "Account is not verified",
      type: "NOT_VERIFIED",
    },
    DB_ERROR: {
      statusCode: 400,
      customMessage: "DB Error : ",
      type: "DB_ERROR",
    },
    INVALID_PASSWORD: {
      statusCode: 400,
      customMessage: "Password you have entered does not match.",
      type: "INVALID_PASSWORD",
    },
    CURRENT_PASSWORD: {
      statusCode: 400,
      customMessage: "Current password you have entered does not match.",
      type: "INVALID_PASSWORD",
    },
    INVALID_EMAIL: {
      statusCode: 400,
      customMessage: "Email you have entered does not exist.",
      type: "INVALID_EMAIL",
    },
    EMAIL_ALREADY_EXISTS: {
      statusCode: 400,
      customMessage: "Email already exist",
      type: "EMAIL_EXIST",
    },
    ADMIN_ALREADY_EXISTS: {
      statusCode: 400,
      customMessage: "Admin already exist",
      type: "ADMIN_EXIST",
    },
    VENDOR_ALREADY_EXISTS: {
      statusCode: 400,
      customMessage: "Vendor already exist",
      type: "VENDOR_EXIST",
    },
    ADMIN_NOT_EXISTS: {
      statusCode: 400,
      customMessage: "Admin not found",
      type: "ADMIN_NOT_FOUND",
    },
    VENDOR_NOT_EXISTS: {
      statusCode: 400,
      customMessage: "Vendor not found",
      type: "VENDOR_NOT_FOUND",
    },
    USER_NOT_EXISTS: {
      statusCode: 400,
      customMessage: "User not found",
      type: "VENDOR_NOT_FOUND",
    },
    PHONE_ALREADY_EXIST: {
      statusCode: 400,
      customMessage: "Mobile number already exist",
      type: "PHONE_ALREADY_EXIST",
    },
    EMAIL_ALREADY_EXIST: {
      statusCode: 400,
      customMessage: "Username you have entered is already registered with us.",
      type: "EMAIL_ALREADY_EXIST",
    },
    INDEX_ALREADY_EXIST: {
      statusCode: 400,
      customMessage: "Index already exists",
      type: "INDEX_ALREADY_EXIST",
    },
    USERNAME_ALREADY_EXIST: {
      statusCode: 400,
      customMessage: "Username you have entered is already registered with us.",
      type: "USERNAME_ALREADY_EXIST",
    },
    MOBILE_ALREADY_EXIST: {
      statusCode: 400,
      customMessage:
        "Mobile number you have entered is already registered with us.",
      type: "MOBILE_ALREADY_EXIST",
    },
    ACCOUNT_APPROVED: {
      statusCode: 400,
      customMessage:
        "Your payment accepted account is not activated by admin.Please wait for the activation.If not registered, then go to profile and complete the verify payment request.",
      type: "ACCOUNT_APPROVED",
    },
    FULLNAME: {
      statusCode: 400,
      customMessage: "Spaces are not allowed in full name.",
      type: "FULLNAME",
    },
    LINK_EXPIRE: {
      statusCode: 400,
      customMessage:
        "This link is expired, Kindly resubmit your email to get new link.",
      type: "ALREADY_EXIST",
    },
    USERNAME_EXIST: {
      statusCode: 400,
      customMessage: "User name you have entered is already taken.",
      type: "USERNAME_EXIST",
    },
    USER_EXIST: {
      statusCode: 400,
      customMessage: "This user is already exists.",
      type: "USER_EXIST",
    },
    EMAIL_ALREADY_EXIST: {
      statusCode: 400,
      customMessage: "Email already exist",
      type: "EMAIL_EXIST",
    },
    PHONE_ALREADY_EXIST: {
      statusCode: 400,
      customMessage: "Mobile number already exist",
      type: "PHONE_ALREADY_EXIST",
    },
    IMP_ERROR: {
      statusCode: 500,
      customMessage: "Implementation error",
      type: "IMP_ERROR",
    },
    APP_ERROR: {
      statusCode: 400,
      customMessage: "Application Error",
      type: "APP_ERROR",
    },
    INVALID_ID: {
      statusCode: 400,
      customMessage: "Invalid Id Provided : ",
      type: "INVALID_ID",
    },
    DUPLICATE: {
      statusCode: 400,
      customMessage: "Duplicate Entry",
      type: "DUPLICATE",
    },
    USERNAME_INVALID: {
      statusCode: 400,
      customMessage: "Username you have entered does not match.",
      type: "USERNAME_INVALID",
    },
    INVALID_PHONE_EMAIL: {
      statusCode: 400,
      customMessage: "No user exist with provided email",
      type: "INVALID_EMAIL",
    },
    INVALID_OTP: {
      statusCode: 400,
      customMessage: "The OTP you have entered does not match or expired",
      type: "INVALID_OTP",
    },
    INVOICE_ERROR: {
      statusCode: 400,
      customMessage: "Invoice not Found.",
      type: "INVOICE_ERROR",
    },
    ALREADY_CANCEL: {
      statusCode: 400,
      customMessage: "This request has been already cancelled by the user.",
      type: "ALREADY_CANCEL",
    },
    INVALID_TOKEN: {
      statusCode: 400,
      customMessage: "The token you have entered does not match.",
      type: "INVALID_TOKEN",
    },
    SAME_PASSWORD: {
      statusCode: 400,
      customMessage: "New password can't be same as Old password.",
      type: "SAME_PASSWORD",
    },
    INCORRECT_OLD_PASSWORD: {
      statusCode: 400,
      customMessage: "Old password you have entered does not match.",
      type: "INCORRECT_OLD_PASSWORD",
    },
    NOT_EXIST: {
      statusCode: 400,
      customMessage: "The record does not exist",
      type: "NOT_EXIST",
    },
    EXIST: {
      statusCode: 400,
      customMessage: "The record already exist",
      type: "EXIST",
    },
    NOT_APPROVED: {
      statusCode: 400,
      customMessage: "Your profile is not approved by admin.",
      type: "NOT_APPROVED",
    },
    PRODUCT_ERROR: {
      statusCode: 400,
      customMessage: "Product/Service data not found",
      type: "PRODUCT_ERROR",
    },
    NOT_ALLOWED: {
      statusCode: 400,
      customMessage: "You are not allowed to execute this operatoin",
      type: "NOT_ALLOWED",
    },
    FILE_TYPE_NOT_ALLOWED: {
      statusCode: 400,
      customMessage: "File type not allowed",
      type: "INVALID_REQUEST",
    },
    EXAM_NOT_FOUND: {
      statusCode: 400,
      customMessage: "Exam not found",
      type: "EXAM_NOT_FOUND",
    },
    EXAM_SLOTS_FULL: {
      statusCode: 400,
      customMessage: "Exam Slots are full",
      type: "EXAM_SLOTS_FULL",
    },
    EXAM_SCHEDULED_ALREADY: {
      statusCode: 400,
      customMessage: "Exam Scheduled already",
      type: "EXAM_SCHEDULED_ALREADY",
    },
    NOT_ENOUGH_MONEY: {
      statusCode: 400,
      customMessage: "Not enough Wallet Balance to enroll into exam",
      type: "LOW_WALLET_BALANCE",
    },
    PHONE_NOT_FOUND: {
      statusCode: 400,
      customMessage: "Phone number not found",
      type: "PHONE_NOT_FOUND",
    },
    CATEGORY_ALREAY_EXIT: {
      statusCode: 400,
      customMessage: "Category Already Exit",
      type: "CATEGORY_ALREAY_EXIT",
    },
    PRODUCT_ALREAY_EXIT: {
      statusCode: 400,
      customMessage: "Product Already Exit",
      type: "PRODUCT_ALREAY_EXIT",
    },
    PRODUCT_ALREAY_EXIT_CART: {
      statusCode: 400,
      customMessage: "Product Already added into cart",
      type: "PRODUCT_ALREAY_EXIT",
    },
    PRODUCT_ALREAY_EXIT_WISHLIST: {
      statusCode: 400,
      customMessage: "Product Already added into wishlist",
      type: "PRODUCT_ALREAY_EXIT",
    },
    BRAND_ALREAY_EXIT: {
      statusCode: 400,
      customMessage: "Brand Already Exit",
      type: "BRAND_ALREAY_EXIT",
    },
    CART_NOT_EXIT: {
      statusCode: 400,
      customMessage: "Cart Not Exit",
      type: "CART_NOT_EXIT",
    },
    CART_ALREAY_EXIT: {
      statusCode: 400,
      customMessage: "Cart Already Exit",
      type: "CART_ALREAY_EXIT",
    },
    ANNOUNCEMENT_ALREAY_EXIT: {
      statusCode: 400,
      customMessage: "Announcement Already Exit",
      type: "ANNOUNCEMENT_ALREAY_EXIT",
    },
    OFFER_ALREAY_EXIT: {
      statusCode: 400,
      customMessage: "Offer Already Exit",
      type: "OFFER_ALREAY_EXIT",
    },
    MINIMUM_PURCHASE: {
      statusCode: 400,
      customMessage: "Apply to this coupon minimum purchase amount is {minimumamount}",
      type: "MINIMUM_PURCHASE",
    },
    REVIEW_ALREADY_EXIT: {
      statusCode: 400,
      customMessage: "Review Already Exit",
      type: "REVIEW_ALREADY_EXIT",
    },
    DISCOUNT_ALREADY_EXIT: {
      statusCode: 400,
      customMessage: "Discount code Already Exit",
      type: "DISCOUNT_ALREADY_EXIT",
    },
    FAQ_ALREADY_EXIT: {
      statusCode: 400,
      customMessage: "Faq Already Exit",
      type: "FAQ_ALREADY_EXIT",
    },
    BLOG_ALREADY_EXIT: {
      statusCode: 400,
      customMessage: "Blog Already Exit",
      type: "BLOG_ALREADY_EXIT",
    },
    TITLE_ALREADY_EXIT: {
      statusCode: 400,
      customMessage: "Title Already Exit",
      type: "TITLE_ALREADY_EXIT",
    },
    BANNER_ALREADY_EXIT: {
      statusCode: 400,
      customMessage: "Banner Already Exit",
      type: "BANNER_ALREADY_EXIT",
    },
    COUPON_EXPIRY: {
      statusCode: 400,
      customMessage: "Coupon is expiry",
      type: "COUPON_EXPIRY",
    },
  },
  SUCCESS: {
    CREATED: {
      statusCode: 200,
      customMessage: "Created Successfully",
      type: "CREATED",
    },
    DEFAULT: {
      statusCode: 200,
      customMessage: "Success",
      type: "DEFAULT",
    },
    PHONE_NOT_EXIST: {
      statusCode: 400,
      customMessage: "Phone number not exists",
      type: "PHONE_NOT_EXIST",
    },
    EMAIL_NOT_EXIST: {
      statusCode: 400,
      customMessage: "This Email not exists.",
      type: "USER_NOT_EXIST",
    },
    UPDATED: {
      statusCode: 200,
      customMessage: "Updated Successfully",
      type: "UPDATED",
    },
    LOGOUT: {
      statusCode: 200,
      customMessage: "Logged Out Successfully",
      type: "LOGOUT",
    },
    LOGIN: {
      statusCode: 200,
      customMessage: "Logged In Successfully",
      type: "LOGIN",
    },
    DELETED: {
      statusCode: 200,
      customMessage: "Deleted Successfully",
      type: "DELETED",
    },
    REGISTER: {
      statusCode: 200,
      customMessage: "Register Successfully",
      type: "REGISTER",
    },
    USER_NOT_EXIST: {
      statusCode: 200,
      customMessage: "This user dose not exists.",
      type: "USER_NOT_EXIST",
    },
    RESPONSE_CREATED: {
      statusCode: 200,
      customMessage: "Your reuqest submitted Successfully",
      type: "RESPONSE_CREATED",
    },
    OTP_SEND: {
      statusCode: 200,
      customMessage: "Otp sent successfully",
      type: "SUCCESS",
    },
    OTP_RESEND: {
      statusCode: 200,
      customMessage: "Otp resend successfully",
      type: "SUCCESS",
    },
    ACCOUNT_ADD: {
      statusCode: 200,
      customMessage: 'Account added Successfully',
      type: 'Account'
    },
    ACCOUNT_UPDATE: {
      statusCode: 200,
      customMessage: 'Account updated Successfully',
      type: 'Account'
    },
    DOCUMENT_ADD: {
      statusCode: 200,
      customMessage: 'Document added Successfully',
      type: 'Document'
    },
    DOCUMENT_UPDATE: {
      statusCode: 200,
      customMessage: 'Document updated Successfully',
      type: 'Document'
    },
    PUBLISHED: {
      statusCode: 200,
      customMessage: 'Publish Successfully',
      type: 'Publish'
    },
    UNPUBLISHED: {
      statusCode: 200,
      customMessage: 'Unpublish Successfully',
      type: 'Unpublish'
    },
    PASSWORD_CHANGE: {
      statusCode: 200,
      customMessage: 'Password change Successfully',
      type: 'Password'
    },
    ACTIVE: {
      statusCode: 200,
      customMessage: 'Active Successfully',
      type: 'Active'
    },
    INACTIVE: {
      statusCode: 200,
      customMessage: 'Inactive Successfully',
      type: 'Inactive'
    },
    ORDERS: {
      statusCode: 200,
      customMessage: 'Order created Successfully',
      type: 'Order'
    },
    BLOCK: {
      statusCode: 200,
      customMessage: 'Block Successfully',
      type: 'block'
    },
    UNBLOCK: {
      statusCode: 200,
      customMessage: 'Unblock Successfully',
      type: 'Unblock'
    },
    VENDOR_BLOCK: {
      statusCode: 200,
      customMessage: 'Vendor block Successfully',
      type: 'Vendor block'
    },
    SUBADMIN_BLOCK: {
      statusCode: 200,
      customMessage: 'SubAdmin block Successfully',
      type: 'Subadmin block'
    },
    SUBADMIN_UNBLOCK: {
      statusCode: 200,
      customMessage: 'SubAdmin Unblock Successfully',
      type: 'Subadmin unblock'
    },
  },
};

const swaggerDefaultResponseMessages = {
  200: { description: "Success" },
  400: { description: "Bad Request" },
  401: { description: "Unauthorized" },
  404: { description: "Data Not Found" },
  500: { description: "Internal Server Error" },
};

const LEVEL_CONSTANTS = { CONTEST_WON: 1, CONTEST_PARTICIPATED: 0.5 };

let APP_CONSTANTS = {
  SERVER: SERVER,
  DATABASE: DATABASE,
  STATUS_MSG: STATUS_MSG,
  swaggerDefaultResponseMessages: swaggerDefaultResponseMessages,
  LEVEL_CONSTANTS: LEVEL_CONSTANTS,
};

module.exports = APP_CONSTANTS;
