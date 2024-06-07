import AWS from 'aws-sdk';


AWS.config.update({ region: 'ap-northeast-2' });

const cloudwatchlogs = new AWS.CloudWatchLogs();

export const getLogsForInstance = async (logGroupName: string, startTime?: number, endTime?: number) => {
  const params = {
    logGroupName,
    limit: 1000, // 원하는 로그 수
    startTime: startTime || Date.now() - 24 * 60 * 60 * 1000, // 기본적으로 지난 24시간 동안의 로그
    endTime: endTime || Date.now(),
  };

  try {
    const data = await cloudwatchlogs.filterLogEvents(params).promise();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw new Error('Error fetching logs');
  }
};
