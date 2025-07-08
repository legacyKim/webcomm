export const handleFocus = (
  labelRef: React.RefObject<HTMLLabelElement | null>,
  boxRef: React.RefObject<HTMLDivElement | null>,
) => {
  if (labelRef.current && boxRef.current) {
    labelRef.current.classList.add("active_label");
    boxRef.current.classList.add("active_box");
  }
};

export const handleBlur = (
  labelRef: React.RefObject<HTMLLabelElement | null>,
  boxRef: React.RefObject<HTMLDivElement | null>,
) => {
  if (labelRef.current && boxRef.current) {
    labelRef.current.classList.remove("active_label");
    boxRef.current.classList.remove("active_box");
  }
};
