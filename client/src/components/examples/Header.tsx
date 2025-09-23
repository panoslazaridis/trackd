import Header from '../Header';

export default function HeaderExample() {
  return (
    <Header 
      user={{
        name: "John Smith",
        email: "john@plumbingpro.co.uk",
        avatar: ""
      }}
    />
  );
}