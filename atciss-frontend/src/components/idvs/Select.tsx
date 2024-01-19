/** @jsxImportSource theme-ui */

export const Select = (
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) => {
  return (
    <select
      sx={{
        fontSize: 5,
        color: "text",
        backgroundColor: "background",
        textAlign: "center",
      }}
      {...props}
    ></select>
  )
}
