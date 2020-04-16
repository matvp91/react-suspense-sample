import createResource from "./createResource";

async function fakeApi(response, delay) {
  console.log("Fetching fake api");
  await new Promise((resolve) => setTimeout(resolve, delay));
  return response;
}

export const ProfileResource = ({ id } = {}) =>
  createResource(() => {
    if (id === 1) {
      return fakeApi({
        id: 1,
        firstName: "Foo",
        lastName: "Bar",
      }, 1000);
    }
  });

export const TimelineResource = ({ id }) =>
  createResource(() => {
    if (id === 1) {
      return fakeApi([
        {
          id: 1,
          message: "I am a message for me",
        },
      ], 3000);
    }
  });
