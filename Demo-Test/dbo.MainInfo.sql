CREATE TABLE [dbo].[MainInfo] (
    [Id]         INT        IDENTITY (1, 1) NOT NULL,
    [FirstName]  NCHAR (10) NULL,
    [LastName]   NCHAR (10) NULL,
    [BirthDate]  DATETIME   NULL,
    [Gender]     BIT        NOT NULL,
    [PositionId] INT        NULL,
    [Minor] VARCHAR(50) NULL, 
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_MainInfo_Position] FOREIGN KEY ([PositionId]) REFERENCES [dbo].[Position] ([Id])
);

