import { ConfigProvider } from "antd";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        //global level 
        token: {
          colorPrimary: "#5c2be2",
          borderRadius: 20,
        },
        //component level
        components: {
          Button: {
            controlHeight: 45,
            controlOutline: "none", //shadow
          },
          Input: {
            controlHeight: 45,
            colorBorder: "#d1d1d1",
            controlOutline: "none",
          },
          Select: {
            controlHeight: 45,
            colorBorder: "#d1d1d1",
            controlOutline: "none",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default ThemeProvider;
