// useConfirm.ts
import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

interface ConfirmOptions {
  title?: string;
  text?: string;
  html?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

type ConfirmType =
  | "success"
  | "delete"
  | "warning"
  | "info"
  | "error"
  | "default";

export const useConfirm = () => {
  const confirm = async (
    type: ConfirmType = "default",
    options: ConfirmOptions = {}
  ): Promise<boolean> => {
    const configs: Record<ConfirmType, SweetAlertOptions> = {
      success: {
        title: "ยืนยันการดำเนินการ",
        text: "คุณต้องการดำเนินการต่อหรือไม่?",
        icon: "success",
        confirmButtonText: "ยืนยัน",
        confirmButtonColor: "#28a745",
      },
      delete: {
        title: "ยืนยันการลบ",
        text: "คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
        icon: "warning",
        confirmButtonText: "ลบ",
        confirmButtonColor: "#dc3545",
      },
      warning: {
        title: "คำเตือน",
        text: "คุณแน่ใจหรือไม่ที่จะดำเนินการต่อ?",
        icon: "warning",
        confirmButtonText: "ดำเนินการต่อ",
        confirmButtonColor: "#ffc107",
      },
      info: {
        title: "ข้อมูล",
        text: "กรุณายืนยันการดำเนินการ",
        icon: "info",
        confirmButtonText: "ยืนยัน",
        confirmButtonColor: "#17a2b8",
      },
      error: {
        title: "เกิดข้อผิดพลาด",
        text: "คุณต้องการลองใหม่หรือไม่?",
        icon: "error",
        confirmButtonText: "ลองใหม่",
        confirmButtonColor: "#dc3545",
      },
      default: {
        title: "ยืนยัน",
        text: "คุณต้องการดำเนินการนี้หรือไม่?",
        icon: "question",
        confirmButtonText: "ยืนยัน",
        confirmButtonColor: "#007bff",
      },
    };

    const config: SweetAlertOptions = {
      ...configs[type],
      ...options,
      showCancelButton: true,
      cancelButtonText: options.cancelButtonText || "ยกเลิก",
      cancelButtonColor: options.cancelButtonColor || "#6c757d",
      reverseButtons: true,
      focusConfirm: false,
      allowOutsideClick: false,
      allowEscapeKey: true,
      buttonsStyling: true,
    };

    try {
      const result: SweetAlertResult = await Swal.fire(config);
      return result.isConfirmed || false;
    } catch (error) {
      console.error("SweetAlert2 Error:", error);
      return false;
    }
  };

  // Quick confirm methods
  const confirmDelete = (options: ConfirmOptions = {}): Promise<boolean> =>
    confirm("delete", options);

  const confirmSuccess = (options: ConfirmOptions = {}): Promise<boolean> =>
    confirm("success", options);

  const confirmWarning = (options: ConfirmOptions = {}): Promise<boolean> =>
    confirm("warning", options);

  const confirmInfo = (options: ConfirmOptions = {}): Promise<boolean> =>
    confirm("info", options);

  const confirmError = (options: ConfirmOptions = {}): Promise<boolean> =>
    confirm("error", options);

  return {
    confirm,
    confirmDelete,
    confirmSuccess,
    confirmWarning,
    confirmInfo,
    confirmError,
  };
};
